using SpacetimeDB;

public static partial class Module
{
    [SpacetimeDB.Table]
    public partial struct Player
    {
        [SpacetimeDB.AutoInc]
        [SpacetimeDB.PrimaryKey]
        public int Id;
        public string Name;
        public int Health;
        public int Speed;
        public int Attack;
        public int AttackSpeed;
        public int BulletCount;
        public bool IsDead;
        public bool IsOnline;

        [SpacetimeDB.Unique]  // Each client gets only one Player
        public Identity Identity;


        // Position
        public float X;
        public float Y;
    }

    // ---- Movement ----
    [Reducer]
    public static void MovePlayer(ReducerContext ctx, int playerId, float newX, float newY)
    {
        var player = ctx.Db.player.Id.Find(playerId);
        if (player is null) { Log.Warn($"Player {playerId} not found!"); return; }
        if (player.IsDead) { Log.Warn($"{player.Name} is dead and cannot move."); return; }

        var world = ctx.Db.world.Id.Find(1);
        if (world is null)
        {
            Log.Warn("World not found, cannot move player.");
            return;
        }

        player.X = Math.Clamp(newX, -world.HalfWidth, world.HalfWidth);
        player.Y = Math.Clamp(newY, -world.HalfHeight, world.HalfHeight);

        ctx.Db.player.Id.Update(player);
        Log.Info($"{player.Name} moved to ({player.X}, {player.Y})");
    }

    // ---- Connection Events ----
    [Reducer(ReducerKind.ClientDisconnected)]
    public static void ClientDisconnected(ReducerContext ctx)
    {
        Log.Info($"Disconnect {ctx.Sender}");

        var player = ctx.Db.player.Identity.Find(ctx.Sender);
        if (player is not null)
        {
            ctx.Db.player.Delete(player);
            Log.Info($"Removed {player.Name} (#{player.Id}) from database.");
        }
        else
        {
            Log.Warn("Warning: No player found for disconnected client.");
        }
    }

    [Reducer(ReducerKind.ClientConnected)]
    public static void ClientConnected(ReducerContext ctx)
    {
        Log.Info($"Connect {ctx.Sender}");

        var player = ctx.Db.player.Identity.Find(ctx.Sender);

        if (player is not null)
        {
            player.IsOnline = true;
            ctx.Db.player.Identity.Update(player);
            Log.Info($"{player.Name} reconnected.");
        }
        else
        {
            ctx.Db.player.Insert(new Player
            {
                Name = $"Player_{ctx.Sender}",
                Identity = ctx.Sender,
                Health = 100,
                Speed = 10,
                Attack = 10,
                AttackSpeed = 1,
                BulletCount = 1,
                IsDead = false,
                IsOnline = true,
                X = 0,
                Y = 0
            });
            Log.Info($"New player created for {ctx.Sender}");
        }
    }


    // ---- Individual Stat Updates ----
    [Reducer]
    public static void UpdateHealth(ReducerContext ctx, int playerId, int amount)
    {
        var player = ctx.Db.player.Id.Find(playerId);
        if (player is null)
        {
            Log.Warn($"Player with ID {playerId} not found!");
            return;
        }

        if (player.IsDead)
        {
            Log.Warn($"{player.Name} (#{player.Id}) is dead. Health cannot be changed.");
            return;
        }

        player.Health += amount;

        if (player.Health <= 0)
        {
            player.Health = 0;
            player.IsDead = true;
            Log.Info($"{player.Name} (#{player.Id}) has died!");
        }

        ctx.Db.player.Id.Update(player);
        Log.Info($"{player.Name}'s Health updated to {player.Health}");
    }

    [Reducer]
    public static void UpdateSpeed(ReducerContext ctx, int playerId, int amount)
    {
        var player = ctx.Db.player.Id.Find(playerId);
        if (player is null) { Log.Warn($"Player {playerId} not found!"); return; }
        if (player.IsDead) { Log.Warn($"{player.Name} is dead. Speed cannot be changed."); return; }

        player.Speed += amount;
        ctx.Db.player.Id.Update(player);
        Log.Info($"{player.Name}'s Speed updated to {player.Speed}");
    }

    [Reducer]
    public static void UpdateAttack(ReducerContext ctx, int playerId, int amount)
    {
        var player = ctx.Db.player.Id.Find(playerId);
        if (player is null) { Log.Warn($"Player {playerId} not found!"); return; }
        if (player.IsDead) { Log.Warn($"{player.Name} is dead. Attack cannot be changed."); return; }

        player.Attack += amount;
        ctx.Db.player.Id.Update(player);
        Log.Info($"{player.Name}'s Attack updated to {player.Attack}");
    }

    [Reducer]
    public static void UpdateAttackSpeed(ReducerContext ctx, int playerId, int amount)
    {
        var player = ctx.Db.player.Id.Find(playerId);
        if (player is null) { Log.Warn($"Player {playerId} not found!"); return; }
        if (player.IsDead) { Log.Warn($"{player.Name} is dead. AttackSpeed cannot be changed."); return; }

        player.AttackSpeed += amount;
        ctx.Db.player.Id.Update(player);
        Log.Info($"{player.Name}'s AttackSpeed updated to {player.AttackSpeed}");
    }

    [Reducer]
    public static void UpdateBulletCount(ReducerContext ctx, int playerId, int amount)
    {
        var player = ctx.Db.player.Id.Find(playerId);
        if (player is null) { Log.Warn($"Player {playerId} not found!"); return; }
        if (player.IsDead) { Log.Warn($"{player.Name} is dead. BulletCount cannot be changed."); return; }

        player.BulletCount += amount;
        ctx.Db.player.Id.Update(player);
        Log.Info($"{player.Name}'s BulletCount updated to {player.BulletCount}");
    }
}