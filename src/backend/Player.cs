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
        public int ObjectId;
        public string Name = "";
        public int MaxHealth;
        public int Health;
        public int Speed;
        public bool IsFiring;
        public int AttackAngle;
        public bool IsDead;
        public bool IsOnline;

        [SpacetimeDB.Unique]  // Each client gets only one Player
        public Identity Identity;

        public ProjectileInfo ProjectileInfo;

        // Position
        public float X;
        public float Y;
    }

    [Reducer]
    public static void MovePlayer(ReducerContext ctx, int playerId, float newX, float newY)
    {
        var player = ctx.Db.Player.Id.Find(playerId);
        // if (player is null) { Log.Warn($"Player {playerId} not found!"); return; }
        // if (player.IsDead) { Log.Warn($"{player.Name} is dead and cannot move."); return; }

        // var world = ctx.Db.World.Id.Find(1);
        // if (world is null)
        // {
        //     Log.Warn("World not found, cannot move player.");
        //     return;
        // }

        // Clamp new position within world bounds
        // float clampedX = Math.Clamp(newX, -world.Width / 2, world.Width / 2);
        // float clampedY = Math.Clamp(newY, -world.Height / 2, world.Height / 2);

        // Check collision with blocks
        // foreach (var block in ctx.Db.Block.Iter())
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
        player.X = newX;
        player.Y = newY;
        ctx.Db.Player.Id.Update(player);

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
        var world = ctx.Db.World.Id.Find(1);

        if (player is not null)
        {
            player.IsOnline = true;
            player.X = world.Width / 2;
            player.Y = world.Height / 2 + 100;
            ctx.Db.Player.Identity.Update(player);
            Log.Info($"{player.Name} reconnected.");
        }
        else
        {
            ctx.Db.Player.Insert(new Player
            {
                Name = "Player",
                Identity = ctx.Sender,
                ObjectId = GenerateRandomInt(),
                Health = 1000000,
                MaxHealth = 1000000,
                Speed = 10,
                IsFiring = false,
                AttackAngle = 0,
                IsDead = false,
                IsOnline = true,
                X = world.Width / 2,
                Y = world.Height / 2 + 100,
                ProjectileInfo = new ProjectileInfo
                {
                    Amount = 2,
                    Speed = 10,
                    Size = 25,
                    Damage = 10,
                    Spread = 10,
                    Color = "#00B2E1",
                    RateOfFire = 4,
                    Lifetime = 1,
                }
            });
            Log.Info($"New player created for {ctx.Sender}");
        }
    }

    [Reducer]
    public static void DamagePlayer(ReducerContext ctx, int enemyId)
    {
        var player = ctx.Db.Player.Identity.Find(ctx.Sender);

        if (player is null) { Log.Warn($"Player not found!"); return; }
        if (player.IsDead) { Log.Warn($"Player is dead and cannot be hit."); return; }

        var enemy = ctx.Db.Enemy.Id.Find(enemyId);

        if (enemy is null)
        {
            Log.Warn("cannot damage player");
            return;
        }

        player.Health -= enemy.ProjectileInfo.Damage;

        if (player.Health <= 0)
        {
            // player.IsDead = true;
            player.Health = 1;
            ctx.Db.Player.Id.Update(player);
            // ctx.Db.Player.Delete(player);
        }
        else
        {
            ctx.Db.Player.Id.Update(player);
        }
    }

    [Reducer]
    public static void UpdateAttack(ReducerContext ctx, int playerId, bool isFiring, int attackAngle)
    {
        var player = ctx.Db.Player.Id.Find(playerId);
        // if (player is null) { Log.Warn($"Player {isfiring} not found!"); return; }
        // if (player.IsDead) { Log.Warn($"{player.Name} is dead. Attack cannot be changed."); return; }

        player.IsFiring = isFiring;
        player.AttackAngle = attackAngle;
        ctx.Db.Player.Id.Update(player);

        // Log.Info($"{player.Name}'s Attack updated to {player.Attack}");
    }

}