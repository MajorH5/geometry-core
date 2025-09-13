using SpacetimeDB;

public static partial class Module
{
    [Table(Name = "Player", Public = true)]
    // [SpacetimeDB.Table]
    public partial class Player
    {
        [SpacetimeDB.AutoInc]
        [SpacetimeDB.PrimaryKey]
        public int Id;
        public string Name = "";
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

    [Reducer]
    public static void MovePlayer(ReducerContext ctx, int playerId, float newX, float newY)
    {
        var player = ctx.Db.Player.Id.Find(playerId);
        if (player is null) { Log.Warn($"Player {playerId} not found!"); return; }
        if (player.IsDead) { Log.Warn($"{player.Name} is dead and cannot move."); return; }

        var world = ctx.Db.World.Id.Find(1);
        if (world is null)
        {
            Log.Warn("World not found, cannot move player.");
            return;
        }

        // Clamp new position within world bounds
        float clampedX = Math.Clamp(newX, -world.Width / 2, world.Width / 2);
        float clampedY = Math.Clamp(newY, -world.Height / 2, world.Height / 2);

        // // Check collision with blocks
        // foreach (var block in ctx.Db.Block.All())
        // {
        //     if (block.IsDestroyed) continue;

        //     // Assuming players and blocks occupy integer grid positions
        //     if (MathF.Abs(block.X - clampedX) < 1 &&
        //         MathF.Abs(block.Y - clampedY) < 1)
        //     {
        //         Log.Info($"{player.Name} cannot move to ({clampedX}, {clampedY}) - blocked by Block {block.Id}");
        //         return; // Cancel movement
        //     }
        // }

        // Update player position if not blocked
        player.X = clampedX;
        player.Y = clampedY;
        ctx.Db.Player.Id.Update(player);

        Log.Info($"{player.Name} moved to ({player.X}, {player.Y})");
    }


    // ---- Connection Events ----
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
            ctx.Db.Player.Identity.Update(player);
            Log.Info($"{player.Name} reconnected.");
        }
        else
        {
            ctx.Db.Player.Insert(new Player
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
        var player = ctx.Db.Player.Id.Find(playerId);
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

        ctx.Db.Player.Id.Update(player);
        Log.Info($"{player.Name}'s Health updated to {player.Health}");
    }

    [Reducer]
    public static void UpdateSpeed(ReducerContext ctx, int playerId, int amount)
    {
        var player = ctx.Db.Player.Id.Find(playerId);
        if (player is null) { Log.Warn($"Player {playerId} not found!"); return; }
        if (player.IsDead) { Log.Warn($"{player.Name} is dead. Speed cannot be changed."); return; }

        player.Speed += amount;
        ctx.Db.Player.Id.Update(player);
        Log.Info($"{player.Name}'s Speed updated to {player.Speed}");
    }

    [Reducer]
    public static void UpdateAttack(ReducerContext ctx, int playerId, int amount)
    {
        var player = ctx.Db.Player.Id.Find(playerId);
        if (player is null) { Log.Warn($"Player {playerId} not found!"); return; }
        if (player.IsDead) { Log.Warn($"{player.Name} is dead. Attack cannot be changed."); return; }

        player.Attack += amount;
        ctx.Db.Player.Id.Update(player);
        Log.Info($"{player.Name}'s Attack updated to {player.Attack}");
    }

    [Reducer]
    public static void UpdateAttackSpeed(ReducerContext ctx, int playerId, int amount)
    {
        var player = ctx.Db.Player.Id.Find(playerId);
        if (player is null) { Log.Warn($"Player {playerId} not found!"); return; }
        if (player.IsDead) { Log.Warn($"{player.Name} is dead. AttackSpeed cannot be changed."); return; }

        player.AttackSpeed += amount;
        ctx.Db.Player.Id.Update(player);
        Log.Info($"{player.Name}'s AttackSpeed updated to {player.AttackSpeed}");
    }

    [Reducer]
    public static void UpdateBulletCount(ReducerContext ctx, int playerId, int amount)
    {
        var player = ctx.Db.Player.Id.Find(playerId);
        if (player is null) { Log.Warn($"Player {playerId} not found!"); return; }
        if (player.IsDead) { Log.Warn($"{player.Name} is dead. BulletCount cannot be changed."); return; }

        player.BulletCount += amount;
        ctx.Db.Player.Id.Update(player);
        Log.Info($"{player.Name}'s BulletCount updated to {player.BulletCount}");
    }
}