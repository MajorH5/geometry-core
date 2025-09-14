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

    [Table(Name = "WorldTickUpdateTimer", Scheduled = nameof(UpdateWorldTick), ScheduledAt = nameof(ScheduledAt))]
    public partial struct WorldTickUpdateTimer
    {
        [PrimaryKey, AutoInc]
        public ulong Id;
        public SpacetimeDB.ScheduleAt ScheduledAt; // Fixed: Use SpacetimeDB.ScheduleAt
    }

    [Reducer(ReducerKind.Init)]
    public static void Init(ReducerContext ctx)
    {
        var world = new World
        {
            Id = 1,
            Width = 4500,
            Height = 4500,
            IsActive = true,
            Tick = 0,
            CurrentWave = 1,
            SpawnRate = 60
        };
        ctx.Db.World.Insert(world);

        ctx.Db.WorldTickUpdateTimer.Insert(new WorldTickUpdateTimer
        {
            ScheduledAt = new SpacetimeDB.ScheduleAt.Interval(TimeSpan.FromMilliseconds(16.6666667)) // Use static Interval method
        });

        InitEnemyTypes(ctx);
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

        ctx.Db.Block.Insert(new Block
        {
            X = world.Width / 2,
            Y = world.Height / 2,
            Health = 1000, // Big HP pool
            IsDestroyed = false,
            Cost = 0,
            IsCore = true,
            width = 25,
            height = 25
        });

        Log.Info("Core block created at (0,0) with 1000 HP");
    }

    [Reducer]
    public static void UpdateWorldTick(ReducerContext ctx, WorldTickUpdateTimer timer)
    {
        var world = ctx.Db.World.Id.Find(1);

        world.Tick++;
        ctx.Db.World.Id.Update(world);

        Random rand = new Random();

        if (world.Tick % (60 * 15) == 5)
        {
            world.CurrentWave += 1;

            // Calculate number of enemies for this wave: ceil(currentwave^1.5)
            int enemyCount = (int)Math.Ceiling(Math.Pow(world.CurrentWave, 1));
            // Heal and upgrade all players for the new wave
            foreach (var player in ctx.Db.Player.Iter())
            {
                if (!player.IsOnline) continue;

                // Heal 10% of max HP
                int healAmount = (int)(player.MaxHealth * 0.1f);
                player.Health = Math.Min(player.MaxHealth, player.Health + healAmount);

                // Randomly choose one upgrade (equal chance for each)
                int upgradeChoice = rand.Next(0, 8); // 0-7 for 8 different upgrades

                switch (upgradeChoice)
                {
                    case 0: // Increase player speed
                        player.Speed = (int)Math.Ceiling(player.Speed * 1.1f);
                        Log.Info($"Player {player.Id} speed increased to {player.Speed}");
                        break;
                    case 1: // Increase player max HP
                        player.MaxHealth = (int)Math.Ceiling(player.MaxHealth * 1.1f);
                        Log.Info($"Player {player.Id} max HP increased to {player.MaxHealth}");
                        break;
                    case 2: // Increase projectile speed
                        player.ProjectileInfo.Speed = (int)Math.Ceiling(player.ProjectileInfo.Speed * 1.1f);
                        Log.Info($"Player {player.Id} projectile speed increased to {player.ProjectileInfo.Speed}");
                        break;
                    case 3: // Increase projectile amount
                        player.ProjectileInfo.Amount = (int)Math.Ceiling(player.ProjectileInfo.Amount * 1.1f);
                        Log.Info($"Player {player.Id} projectile amount increased to {player.ProjectileInfo.Amount}");
                        break;
                    case 4: // Increase projectile damage
                        player.ProjectileInfo.Damage = (int)Math.Ceiling(player.ProjectileInfo.Damage * 1.1f);
                        Log.Info($"Player {player.Id} projectile damage increased to {player.ProjectileInfo.Damage}");
                        break;
                    case 5: // Increase rate of fire
                        player.ProjectileInfo.RateOfFire = (int)Math.Ceiling(player.ProjectileInfo.RateOfFire * 1.1f);
                        Log.Info($"Player {player.Id} rate of fire increased to {player.ProjectileInfo.RateOfFire}");
                        break;
                    case 6: // Increase projectile size
                        player.ProjectileInfo.Size = (int)Math.Ceiling(player.ProjectileInfo.Size * 1.1f);
                        Log.Info($"Player {player.Id} projectile size increased to {player.ProjectileInfo.Size}");
                        break;
                    case 7: // Increase player speed (duplicate for equal chance)
                        player.Speed = (int)Math.Ceiling(player.Speed * 1.1f);
                        Log.Info($"Player {player.Id} speed increased to {player.Speed}");
                        break;
                }

                ctx.Db.Player.Id.Update(player);
                Log.Info($"Player {player.Id} healed {healAmount} HP (now {player.Health}/{player.MaxHealth})");
            }

            Log.Info($"Wave {world.CurrentWave} starting! Spawning {enemyCount} enemies");

            for (int i = 0; i < enemyCount; i++)
            {
                // Determine enemy type with weighted probability
                int randomEnemyType;
                double spawnChance = rand.NextDouble(); // 0.0 to 1.0

                if (spawnChance < 0.15) // 15% chance for Tank
                {
                    randomEnemyType = EnemyTypeIds.TANK;
                }
                else // 85% chance split equally between the other 3 types (28.33% each)
                {
                    double normalizedChance = (spawnChance - 0.15) / 0.85; // Normalize to 0-1 range

                    if (normalizedChance < 0.333) // ~28.33% of total
                    {
                        randomEnemyType = EnemyTypeIds.SPIKER;
                    }
                    else if (normalizedChance < 0.666) // ~28.33% of total  
                    {
                        randomEnemyType = EnemyTypeIds.SHOOTER;
                    }
                    else // ~28.33% of total
                    {
                        randomEnemyType = EnemyTypeIds.BLASTER;
                    }
                }

                // Spawn at random position on world border
                float spawnX, spawnY;
                int edge = rand.Next(0, 4); // 0=left, 1=right, 2=top, 3=bottom

                switch (edge)
                {
                    case 0: // Left edge
                        spawnX = 0;
                        spawnY = rand.Next(0, world.Height);
                        break;
                    case 1: // Right edge
                        spawnX = world.Width;
                        spawnY = rand.Next(0, world.Height);
                        break;
                    case 2: // Top edge
                        spawnX = rand.Next(0, world.Width);
                        spawnY = 0;
                        break;
                    case 3: // Bottom edge
                        spawnX = rand.Next(0, world.Width);
                        spawnY = world.Height;
                        break;
                    default:
                        spawnX = 0;
                        spawnY = 0;
                        break;
                }

                SpawnEnemy(ctx, randomEnemyType, spawnX, spawnY);

                string enemyTypeName = randomEnemyType == EnemyTypeIds.SPIKER ? "SPIKER" :
                                     randomEnemyType == EnemyTypeIds.SHOOTER ? "SHOOTER" :
                                     randomEnemyType == EnemyTypeIds.BLASTER ? "BLASTER" : "TANK";
                Log.Info($"Spawned {enemyTypeName} at ({spawnX}, {spawnY}) on edge {edge}");
            }

            // Update world with new wave
            ctx.Db.World.Id.Update(world);
        }

        // --- Move and shoot enemies ---
        foreach (var enemy in ctx.Db.Enemy.Iter())
        {
            if (enemy.IsDead) continue;

            // Check if this enemy is a SHOOTER type
            if (enemy.TypeId == EnemyTypeIds.SHOOTER || enemy.TypeId == EnemyTypeIds.TANK || enemy.TypeId == EnemyTypeIds.BLASTER)
            {
                // Find the closest player to target
                Player closestPlayer = null;
                float closestDistance = float.MaxValue;

                foreach (var player in ctx.Db.Player.Iter())
                {
                    if (player.IsDead || !player.IsOnline) continue;

                    float dx = player.X - enemy.X;
                    float dy = player.Y - enemy.Y;
                    float distance = MathF.Sqrt(dx * dx + dy * dy);

                    if (distance < closestDistance)
                    {
                        closestDistance = distance;
                        closestPlayer = player;
                    }
                }

                // If we found a player to target
                if (closestPlayer != null)
                {
                    // Calculate angle to target player
                    float dx = closestPlayer.X - enemy.X;
                    float dy = closestPlayer.Y - enemy.Y;

                    // Calculate angle in degrees (0° = right, 90° = down, 180° = left, 270° = up)
                    float angleRadians = MathF.Atan2(dy, dx);
                    float angleDegrees = angleRadians * (180f / MathF.PI);

                    // Normalize angle to 0-360 range
                    if (angleDegrees < 0)
                        angleDegrees += 360;

                    // Add random spread of +/- 5 degrees
                    float randomSpread = (float)(rand.NextDouble() * 10 - 5); // -5 to +5 degrees
                    float finalAngle = angleDegrees + randomSpread;

                    // Normalize final angle to 0-360 range
                    if (finalAngle < 0)
                        finalAngle += 360;
                    else if (finalAngle >= 360)
                        finalAngle -= 360;

                    // Attack with calculated angle
                    Attack(ctx, enemy.Id, true, (int)finalAngle);

                }
                else
                {
                    // No players found, shoot at core or don't shoot
                    Attack(ctx, enemy.Id, true, 0);
                }
            }
            else
            {
            }

            // Move enemy toward core
            MoveEnemyTowardCore(ctx, enemy.Id);
        }

    }

    // ////////////////////////////////////////////////////////////////////////////////
    // ///                BLOCKS
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

        public bool IsCore;
        public int width;
        public int height;
    }

    [Reducer] // Fixed: Removed duplicate [Reducer] attribute
    public static void PlaceBlock(ReducerContext ctx, float x, float y, int health = 50, int width = 5, int height = 5)
    {
        // Check for overlaps
        foreach (var block in ctx.Db.Block.Iter())
        {
            if (block.IsDestroyed) continue;

            bool overlapX = MathF.Abs(block.X - x) < (block.width / 2f + width / 2f);
            bool overlapY = MathF.Abs(block.Y - y) < (block.height / 2f + height / 2f);

            if (overlapX && overlapY)
            {
                Log.Warn($"Cannot place block at ({x},{y}) - overlaps with block {block.Id} at ({block.X},{block.Y})");
                return; // cancel placement
            }
        }

        // No overlaps -> insert block
        ctx.Db.Block.Insert(new Block
        {
            X = x,
            Y = y,
            Health = health,
            IsDestroyed = false,
            IsCore = false,
            width = width,
            height = height
        });

        Log.Info($"Block placed at ({x}, {y}) with {health} HP, size {width}x{height}");
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

        var world = ctx.Db.World.Id.Find(1);
        if (world is null) return;

        float targetX = world.Width/2f;
        float targetY = world.Height/2f;

        float dx = targetX - enemy.X;
        float dy = targetY - enemy.Y;
        float dist = MathF.Sqrt(dx * dx + dy * dy);

        // Normalize direction and calculate next position
        float stepX = (dx / dist) * enemy.Speed;
        float stepY = (dy / dist) * enemy.Speed;
        float nextX = enemy.X + stepX;
        float nextY = enemy.Y + stepY;

        // --- CORE CHECK FIRST (using your working method) ---
        float coreDistance = MathF.Sqrt((targetX - nextX) * (targetX - nextX) +
                                       (targetY - nextY) * (targetY - nextY));

        if (coreDistance < 15f) // Increased from 1f to be more forgiving
        {
            // Find and damage the core block
            var coreBlock = ctx.Db.Block.Iter().FirstOrDefault(b => b.IsCore && !b.IsDestroyed);
            if (coreBlock != null)
            {
                coreBlock.Health -= enemy.Health;
                if (coreBlock.Health <= 0)
                {
                    coreBlock.Health = 0;
                    coreBlock.IsDestroyed = true;
                    Log.Info("Core destroyed! Game over!");
                }
                ctx.Db.Block.Id.Update(coreBlock);
                Log.Info($"Enemy (#{enemy.Id}) dealt {enemy.Health} damage to the core! Core HP: {coreBlock.Health}");
            }

            // Delete enemy after hitting core
            ctx.Db.Enemy.Id.Delete(enemy.Id);
            Log.Info($"Enemy (#{enemy.Id}) reached core and was deleted!");
            return;
        }

        // --- PLAYER COLLISION CHECK ---
        foreach (var player in ctx.Db.Player.Iter())
        {
            if (player.IsDead || !player.IsOnline) continue;

            float playerDist = MathF.Sqrt((player.X - nextX) * (player.X - nextX) +
                                          (player.Y - nextY) * (player.Y - nextY));

            if (playerDist < 45f) // Collision radius for player (adjust as needed)
            {
                Log.Info($"Enemy (#{enemy.Id}) collided with player {player.Id} at distance {playerDist:F2}");

                // Damage the player using enemy's attack power
                player.Health -= enemy.Health;
                if (player.Health <= 0)
                {
                    player.Health = 1; // Your system sets health to 1 instead of killing
                    Log.Info($"Player (#{player.Id}) health reduced to 1 by enemy (#{enemy.Id})!");
                }
                ctx.Db.Player.Id.Update(player);

                // Enemy always dies when hitting a player (like your original logic)
                ctx.Db.Enemy.Id.Delete(enemy.Id);
                Log.Info($"Enemy (#{enemy.Id}) destroyed after hitting player {player.Id}");
                return;
            }
        }


        // --- BLOCK COLLISION CHECK (for non-core blocks) ---
        foreach (var block in ctx.Db.Block.Iter())
        {
            if (block.IsDestroyed || block.IsCore) continue; // Skip destroyed blocks and core (handled above)

            float blockDist = MathF.Sqrt((block.X - nextX) * (block.X - nextX) +
                                         (block.Y - nextY) * (block.Y - nextY));

            if (blockDist < (block.width / 2f) + 2f) // Added small buffer
            {
                // Regular block collision logic
                if (block.Health >= enemy.Health)
                {
                    // Block survives, enemy dies
                    block.Health -= enemy.Health;
                    if (block.Health <= 0)
                    {
                        block.Health = 0;
                        block.IsDestroyed = true;
                        Log.Info($"Block {block.Id} destroyed at ({block.X}, {block.Y})");
                    }
                    ctx.Db.Block.Id.Update(block);

                    ctx.Db.Enemy.Id.Delete(enemy.Id);
                    Log.Info($"Enemy (#{enemy.Id}) destroyed by block {block.Id} (block HP ≥ enemy HP)");
                    return;
                }
                else
                {
                    // Enemy survives, block destroyed
                    enemy.Health -= block.Health;
                    if (enemy.Health <= 0)
                    {
                        enemy.Health = 0;
                        enemy.IsDead = true;
                        ctx.Db.Enemy.Id.Update(enemy);
                        Log.Info($"Enemy (#{enemy.Id}) killed in clash with block {block.Id}!");
                        return;
                    }
                    else
                    {
                        ctx.Db.Enemy.Id.Update(enemy);
                        Log.Info($"Enemy (#{enemy.Id}) survived after destroying block {block.Id}");
                    }

                    block.Health = 0;
                    block.IsDestroyed = true;
                    ctx.Db.Block.Id.Update(block);
                    return;
                }
            }
        }

        // Move enemy if no collision
        enemy.X = nextX;
        enemy.Y = nextY;
        ctx.Db.Enemy.Id.Update(enemy);
    }
}