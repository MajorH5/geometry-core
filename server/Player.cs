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

    [SpacetimeDB.Reducer]
    public static void MovePlayer(ReducerContext ctx, int playerId, float newX, float newY)
    {
        var player = ctx.Db.Player.Get(playerId);
        if (player == null) { Log.Warn($"Player {playerId} not found!"); return; }
        if (player.IsDead) { Log.Warn($"{player.Name} is dead and cannot move."); return; }

        // Fetch the world (assuming only one exists, with ID=1)
        var world = ctx.Db.World.Get(1);
        if (world == null) 
        {
            Log.Warn("World not found, cannot move player.");
            return;
        }

        // Clamp within world bounds
        player.X = Math.Clamp(newX, -world.HalfWidth, world.HalfWidth);
        player.Y = Math.Clamp(newY, -world.HalfHeight, world.HalfHeight);

        ctx.Db.Player.Update(player);
        Log.Info($"{player.Name} moved to ({player.X}, {player.Y})");
    }

    [Reducer(ReducerKind.ClientDisconnected)]
    public static void ClientDisconnected(ReducerContext ctx)
    {
        Log.Info($"Disconnect {ctx.Sender}");

        var player = ctx.Db.Player.Identity.Find(ctx.Sender);
        if (player is not null)
        {
            ctx.Db.Player.Delete(player);
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

        var player = ctx.Db.Player.Identity.Find(ctx.Sender);

        if (player is not null)
        {
            player.IsOnline = true;
            ctx.Db.Player.Update(player);
            Log.Info($"{player.Name} reconnected.");
        }
        else
        {
            ctx.Db.Player.Insert(new Player
            {
                Name = $"Player_{ctx.Sender}", // or wait for them to set a name
                Identity = ctx.Sender,
                Health = 100,
                Speed = 10,
                Attack = 10,
                AttackSpeed = 1,
                BulletCount = 1,
                IsDead = false,
                IsOnline = true
            });
            Log.Info($"New player created for {ctx.Sender}");
        }
    }


    // ---- Individual Stat Updates ----
    [SpacetimeDB.Reducer]
    public static void UpdateHealth(ReducerContext ctx, int playerId, int amount)
    {
        var playerOpt = ctx.Db.Player.Get(playerId);
        if (playerOpt == null)
        {
            Log.Warn($"Player with ID {playerId} not found!");
            return;
        }

        var player = playerOpt.Value;

        if (player.isDead)
        {
            Log.Warn($"{player.name} (#{player.id}) is dead. Health cannot be changed.");
            return;
        }

        player.health += amount;

        if (player.health <= 0)
        {
            player.health = 0;
            player.isDead = true;
            Log.Info($"{player.name} (#{player.id}) has died!");
        }

        ctx.Db.Player.Update(player);
        Log.Info($"{player.name}'s Health updated to {player.health}");
    }



    [SpacetimeDB.Reducer]
    public static void UpdateSpeed(ReducerContext ctx, int playerId, int amount)
    {
        var player = ctx.Db.Player.Get(playerId);
        if (player == null) { Log.Warn($"Player {playerId} not found!"); return; }
        if (player.isDead) { Log.Warn($"{player.Name} is dead. Speed cannot be changed."); return; }

        player.Speed += amount;
        ctx.Db.Player.Update(player);
        Log.Info($"{player.Name}'s Speed updated to {player.Speed}");
    }

    [SpacetimeDB.Reducer]
    public static void UpdateAttack(ReducerContext ctx, int playerId, int amount)
    {
        var player = ctx.Db.Player.Get(playerId);
        if (player == null) { Log.Warn($"Player {playerId} not found!"); return; }
        if (player.isDead) { Log.Warn($"{player.Name} is dead. Attack cannot be changed."); return; }

        player.Attack += amount;
        ctx.Db.Player.Update(player);
        Log.Info($"{player.Name}'s Attack updated to {player.Attack}");
    }

    [SpacetimeDB.Reducer]
    public static void UpdateAttackSpeed(ReducerContext ctx, int playerId, int amount)
    {
        var player = ctx.Db.Player.Get(playerId);
        if (player == null) { Log.Warn($"Player {playerId} not found!"); return; }
        if (player.isDead) { Log.Warn($"{player.Name} is dead. AttackSpeed cannot be changed."); return; }

        player.AttackSpeed += amount;
        ctx.Db.Player.Update(player);
        Log.Info($"{player.Name}'s AttackSpeed updated to {player.AttackSpeed}");
    }

    [SpacetimeDB.Reducer]
    public static void UpdateBulletCount(ReducerContext ctx, int playerId, int amount)
    {
        var player = ctx.Db.Player.Get(playerId);
        if (player == null) { Log.Warn($"Player {playerId} not found!"); return; }
        if (player.isDead) { Log.Warn($"{player.Name} is dead. BulletCount cannot be changed."); return; }

        player.BulletCount += amount;
        ctx.Db.Player.Update(player);
        Log.Info($"{player.Name}'s BulletCount updated to {player.BulletCount}");
    }
}