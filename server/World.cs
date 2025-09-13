using SpacetimeDB;
using System;

public static partial class Module
{
    [Table(Name = "world", Public = true)]
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
        var existing = ctx.Db.world.Id.Find(1);
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

        ctx.Db.world.Insert(world);
        Log.Info($"World created with size {world.Width}x{world.Height}");
    }

    [Reducer]
    public static void UpdateWorldTick(ReducerContext ctx)
    {
        var world = ctx.Db.world.Id.Find(1);
        if (world is null) { Log.Warn("No world found."); return; }

        world.Tick++;
        ctx.Db.world.Id.Update(world);

        Log.Info($"World tick updated: {world.Tick}");
    }
}
