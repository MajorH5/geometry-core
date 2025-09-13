using SpacetimeDB;
using System;

public static partial class Module
{
    [Table(Name = "World", Public = true)]
    public partial class World
    {
        [PrimaryKey] // Only 1 world row, fixed to ID = 1
        public int Id;

        // Size of the game world in pixels
        public int Width;
        public int Height;

        // Game state tracking
        public bool IsActive;   // Is the game currently running?
        public int Tick;        // Frame or tick counter (for syncing bullets, waves, etc.)

        // Difficulty / wave progression
        public int CurrentWave;
        public float SpawnRate; // How often enemies spawn
    }

    [Reducer]
    public static void CreateWorld(ReducerContext ctx, int width, int height)
    {
        // Prevent duplicate worlds
        var existing = ctx.Db.World.Id.Find(1);
        if (existing is not null)
        {
            Log.Warn("World already exists!");
            return;
        }

        var world = new World
        {
            Id = 1, // fixed world ID
            Width = width,
            Height = height,
            IsActive = true,
            Tick = 0,
            CurrentWave = 1,
            SpawnRate = 1.0f
        };

        ctx.Db.World.Insert(world);
        Log.Info($"World created with size {world.Width}x{world.Height}");
    }

    [Reducer]
    public static void UpdateWorldTick(ReducerContext ctx)
    {
        var world = ctx.Db.World.Id.Find(1);
        if (world is null) { Log.Warn("No world found."); return; }

        world.Tick++;
        ctx.Db.World.Id.Update(world);

        Random rand = new Random();

        if (world.Tick % (int)(1f / world.SpawnRate) == 0)
        {
            for (int i = 0; i < world.CurrentWave; i++)
            {
                SpawnEnemy(ctx, 100 + world.Tick, 5 + world.Tick, 5 + world.Tick, 1);
            }
        }

        // --- Move and shoot enemies ---
        foreach (var enemy in ctx.Db.Enemy.Iter())
        {
            if (enemy.IsDead) continue;

            MoveEnemyTowardCore(ctx, enemy.Id);

            // Initialize NextShootTick if first time
            if (enemy.NextShootTick == 0)
            {
                enemy.NextShootTick = world.Tick + rand.Next(10, 30); // small delay after spawn
                ctx.Db.Enemy.Id.Update(enemy);
                continue;
            }

            // Check if it's time to shoot
            if (world.Tick >= enemy.NextShootTick)
            {
                bool spreadShot = rand.NextDouble() < 0.5;

                if (spreadShot)
                {
                    EnemySpreadShot(ctx, enemy.Id, 6, 0.5f + 0.01f * world.Tick); // speed scales with tick
                }
                else
                {
                    EnemyShootAtClosestPlayer(ctx, enemy.Id, 0.5f + 0.01f * world.Tick);
                }

                // Random delay until next shot
                enemy.NextShootTick = world.Tick + rand.Next(10, 40);
                ctx.Db.Enemy.Id.Update(enemy);
            }
        }

        // --- Spawn new enemies based on wave ---
        if (world.Tick % (int)(1f / world.SpawnRate) == 0)
        {
            for (int i = 0; i < world.CurrentWave; i++)
            {
                SpawnEnemy(ctx, 100 + world.Tick, 5 + world.Tick, 5 + world.Tick, 1);
            }
        }

        // --- Update projectiles ---
        foreach (var projectile in ctx.Db.Projectile.Iter())
        {
            // Move projectile
            projectile.X += projectile.VelocityX;
            projectile.Y += projectile.VelocityY;

            // Enemy projectiles hitting players
            if (projectile.FromEnemy)
            {
                foreach (var player in ctx.Db.Player.Iter())
                {
                    if (player.IsDead) continue;

                    float dx = player.X - projectile.X;
                    float dy = player.Y - projectile.Y;

                    if (MathF.Sqrt(dx * dx + dy * dy) < 1.0f)
                    {
                        player.Health -= projectile.Damage;
                        if (player.Health <= 0)
                        {
                            player.Health = 0;
                            player.IsDead = true;
                            Log.Info($"Player (#{player.Id}) was killed by a projectile!");
                        }
                        ctx.Db.Player.Id.Update(player);

                        // Remove projectile after hitting
                        ctx.Db.Projectile.Id.Delete(projectile.Id);
                        break;
                    }
                }
            }

            // Player projectiles hitting enemies
            if (!projectile.FromEnemy)
            {
                foreach (var enemy in ctx.Db.Enemy.Iter())
                {
                    if (enemy.IsDead) continue;

                    float dx = enemy.X - projectile.X;
                    float dy = enemy.Y - projectile.Y;

                    if (MathF.Sqrt(dx * dx + dy * dy) < 1.0f) // collision radius
                    {
                        enemy.Health -= projectile.Damage;
                        if (enemy.Health <= 0)
                        {
                            enemy.Health = 0;
                            enemy.IsDead = true;
                            Log.Info($"Enemy (#{enemy.Id}) was killed by a player projectile!");
                        }
                        ctx.Db.Enemy.Id.Update(enemy);

                        // Remove projectile after hitting
                        ctx.Db.Projectile.Id.Delete(projectile.Id);
                        break; // stop checking other enemies
                    }
                }
            }


            // Remove projectile if out of bounds
            if (MathF.Abs(projectile.X) > world.Width / 2 || MathF.Abs(projectile.Y) > world.Height / 2)
            {
                ctx.Db.Projectile.Id.Delete(projectile.Id);
                continue;
            }

            // Update projectile in DB
            ctx.Db.Projectile.Id.Update(projectile);
        }

        Log.Info($"World tick updated: {world.Tick}");
    }



    // ////////////////////////////////////////////////////////////////////////////////
    // /// 
    // ///                BLOCKS
    // /// 
    // //////////////////////////////////////////////////////////////////////////////////


    [Table(Name = "Block", Public = true)]
    public partial class Block
    {
        [SpacetimeDB.AutoInc]
        [SpacetimeDB.PrimaryKey]
        public int Id;

        public float X;
        public float Y;
        public int Health;
        public bool IsDestroyed;
        public int Cost;
    }

    [Reducer]
    public static void PlaceBlock(ReducerContext ctx, float x, float y, int health = 50)
    {
        // TODO: you could check if another block already exists at this tile
        ctx.Db.Block.Insert(new Block
        {
            X = x,
            Y = y,
            Health = health,
            IsDestroyed = false
        });

        Log.Info($"Block placed at ({x}, {y}) with {health} HP");
    }

    [Reducer]
    public static void DamageBlock(ReducerContext ctx, int blockId, int damage)
    {
        var block = ctx.Db.Block.Id.Find(blockId);
        if (block == null) { Log.Warn($"Block {blockId} not found!"); return; }
        if (block.IsDestroyed) return;

        block.Health -= damage;
        if (block.Health <= 0)
        {
            block.Health = 0;
            block.IsDestroyed = true;
            ctx.Db.Block.Id.Update(block);

            Log.Info($"Block {block.Id} destroyed at ({block.X}, {block.Y})");
            return;
        }

        ctx.Db.Block.Id.Update(block);
        Log.Info($"Block {block.Id} at ({block.X}, {block.Y}) took {damage}, HP={block.Health}");
    }

    [Reducer]
    public static void MoveEnemyTowardCore(ReducerContext ctx, int enemyId)
    {
        var enemy = ctx.Db.Enemy.Id.Find(enemyId);
        if (enemy is null || enemy.IsDead) return;

        float targetX = 0;
        float targetY = 0;

        float dx = targetX - enemy.X;
        float dy = targetY - enemy.Y;
        float dist = MathF.Sqrt(dx * dx + dy * dy);
        if (dist < 0.1f)
        {
            Log.Info($"Enemy (#{enemy.Id}) reached the core!");
            // Optionally, apply damage to core here
            return;
        }

        // Normalize direction
        float stepX = (dx / dist) * enemy.Speed;
        float stepY = (dy / dist) * enemy.Speed;

        float nextX = enemy.X + stepX;
        float nextY = enemy.Y + stepY;

        // --- Check collisions ---

        // Blocks
        foreach (var block in ctx.Db.Block.Iter())
        {
            if (!block.IsDestroyed &&
                MathF.Abs(block.X - nextX) < 1 &&
                MathF.Abs(block.Y - nextY) < 1)
            {
                DamageBlock(ctx, block.Id, enemy.Attack);
                Log.Info($"Enemy (#{enemy.Id}) attacked block {block.Id} at ({block.X},{block.Y})");
                return;
            }
        }

        // Players
        foreach (var player in ctx.Db.Player.Iter())
        {
            if (player.IsDead) continue;
            if (MathF.Sqrt((player.X - nextX) * (player.X - nextX) + (player.Y - nextY) * (player.Y - nextY)) < 1f)
            {
                player.Health -= enemy.Attack;
                if (player.Health <= 0)
                {
                    player.Health = 0;
                    player.IsDead = true;
                    Log.Info($"Player (#{player.Id}) killed by enemy!");
                }
                ctx.Db.Player.Id.Update(player);
                return;
            }
        }

        // Core
        if (MathF.Sqrt(nextX * nextX + nextY * nextY) < 1f)
        {
            Log.Info($"Enemy (#{enemy.Id}) damaged the core!");
            return;
        }

        // Move enemy if no collision
        enemy.X = nextX;
        enemy.Y = nextY;
        ctx.Db.Enemy.Id.Update(enemy);

        Log.Info($"Enemy (#{enemy.Id}) moved to ({enemy.X}, {enemy.Y})");
    }

}
