using SpacetimeDB;

public static partial class Module
{
    [SpacetimeDB.Table]
    public partial struct World
    {
        [SpacetimeDB.PrimaryKey] // Only 1 world row, so we can fix the ID to 1
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

    [SpacetimeDB.Reducer]
    public static void CreateWorld(ReducerContext ctx, int width, int height)
    {
        // Prevent duplicate worlds
        var existing = ctx.Db.World.Get(1);
        if (existing != null)
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

    [SpacetimeDB.Reducer]
    public static void UpdateWorldTick(ReducerContext ctx)
    {
        var worldOpt = ctx.Db.World.Get(1);
        if (worldOpt == null) { Log.Warn("No world found."); return; }
        var world = worldOpt.Value;

        world.Tick++;
        ctx.Db.World.Update(world);
    }

}