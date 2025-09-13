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

        foreach (var enemy in ctx.Db.Enemy.Iter())
        {
            if (!enemy.IsDead)
                MoveEnemyTowardCore(ctx, enemy.Id);
        }

        if (world.Tick % (int)(1f / world.SpawnRate) == 0)
        {
            for (int i = 0; i < world.CurrentWave; i++)
            {
                SpawnEnemy(ctx, 100 + world.Tick , 5 + world.Tick, 5 + world.Tick, 1);
            }
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

    // --- Enemy Movement Toward Core (0,0) ---
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
            Log.Info($"{enemy.Id} reached the core!");
            return;
        }

        // Normalize direction
        float stepX = (dx / dist) * enemy.Speed;
        float stepY = (dy / dist) * enemy.Speed;

        float nextX = enemy.X + stepX;
        float nextY = enemy.Y + stepY;

        // Check for a block at next position
        foreach (var block in ctx.Db.Block.Iter())
        {
            if (!block.IsDestroyed &&
                MathF.Abs(block.X - nextX) < 1 &&
                MathF.Abs(block.Y - nextY) < 1)
            {
                // Attack block instead of moving
                DamageBlock(ctx, block.Id, enemy.Attack);
                Log.Info($"{enemy.Id} attacked block {block.Id} at ({block.X},{block.Y})");
                return;
            }
        }

        // Move enemy forward
        enemy.X = nextX;
        enemy.Y = nextY;
        ctx.Db.Enemy.Id.Update(enemy);

        // Broadcast position for frontend (via websocket subscription)
        Log.Info($"{enemy.Id} moved to ({enemy.X}, {enemy.Y})");
    }
}
