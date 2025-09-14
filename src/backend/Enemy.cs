using SpacetimeDB;
using System;
using System.Collections.Generic;

public static partial class Module
{
    public static class EnemyTypeIds
    {
        public const int SPIKER = 1;
        public const int SHOOTER = 2;
        public const int BLASTER = 3;
        public const int TANK = 4;
    }

    [SpacetimeDB.Type]
    public partial struct ProjectileInfo
    {
        public int Amount; // number of projectiles
        public int Speed; // speed of each
        public int Size; // size of projectile in pixels
        public int Damage; // dmg each shot does
        public int Spread; // spread between each shot
        public string Color; // color of each shot
        public float RateOfFire; // amount of shots taken per second
        public int Lifetime; // how long each shot lasts
    }

    [Table(Name = "EnemyType", Public = true)]
    public partial class EnemyType
    {
        [PrimaryKey]
        public int TypeId;
        public int MaxHealth;
        public int Speed;
        public float Size;
        public ProjectileInfo ProjectileInfo;
    }

    public static int GenerateRandomInt()
    {
        Random rand = new Random();
        return rand.Next(0, 1_000_000);
    }


    [Reducer]
    public static void InitEnemyTypes(ReducerContext ctx)
    {
        var existingTypes = ctx.Db.EnemyType.Iter().ToArray();
        if (existingTypes.Length > 0)
        {
            Log.Info("Enemy types already initialized");
            return;
        }

        ctx.Db.EnemyType.Insert(new EnemyType
        {
            TypeId = EnemyTypeIds.SPIKER,
            MaxHealth = 15,
            Speed = 5,
            Size = 80,
            ProjectileInfo = new ProjectileInfo
            {
                Amount = 1,
                Speed = 10,
                Size = 20,
                Damage = 5,
                Spread = 0,
                Color = "#ff0000",
                RateOfFire = 3,
                Lifetime = 1,
            }
        });

        ctx.Db.EnemyType.Insert(new EnemyType
        {
            TypeId = EnemyTypeIds.SHOOTER,
            MaxHealth = 35,
            Speed = 1,
            Size = 40,
            ProjectileInfo = new ProjectileInfo
            {
                Amount = 4,
                Speed = 8,
                Size = 25,
                Damage = 20,
                Spread = 360 / 4,
                Color = "#ff0000",
                RateOfFire = 1,
                Lifetime = 10,
            }
        });

        ctx.Db.EnemyType.Insert(new EnemyType
        {
            TypeId = EnemyTypeIds.BLASTER,
            MaxHealth = 40,
            Speed = 1,
            Size = 40,
            ProjectileInfo = new ProjectileInfo
            {
                Amount = 1,
                Speed = 8,
                Size = 20,
                Damage = 10,
                Spread = 10,
                Color = "#18046fff",
                RateOfFire = 1,
                Lifetime = 20
            }
        });

        ctx.Db.EnemyType.Insert(new EnemyType
        {
            TypeId = EnemyTypeIds.TANK,
            MaxHealth = 70,
            Speed = 1,
            Size = 40,
            ProjectileInfo = new ProjectileInfo
            {
                Amount = 10,
                Speed = 4,
                Size = 50,
                Damage = 10,
                Spread = 3,
                Color = "#bb1d01ff",
                RateOfFire = 0.1f,
                Lifetime = 3
            }
        });

        Log.Info("Enemy types initialized successfully");
    }

    // ---------------- Enemy Table ----------------
    [Table(Name = "Enemy", Public = true)]
    public partial class Enemy
    {
        [AutoInc]
        [PrimaryKey]
        public int Id;
        public int TypeId;
        public int ObjectId;
        public int MaxHealth;
        public int Health;
        public int Speed;
        public bool IsDead;
        public bool IsFiring;
        public int AttackAngle;
        public ProjectileInfo ProjectileInfo;

        // Position on grid
        public float X;
        public float Y;
    }
    // ---------------- Reducers ----------------

    [Reducer]
    public static void Attack(ReducerContext ctx, int enemyId, bool isAttacking, int shootAngle = 0)
    {
        var enemy = ctx.Db.Enemy.Id.Find(enemyId);

        if (enemy is null) { Log.Warn($"Enemy {enemyId} not found!"); return; }
        if (enemy.IsDead) { Log.Warn($"Enemy is dead and cannot shoot."); return; }

        enemy.IsFiring = isAttacking;
        enemy.AttackAngle = shootAngle;

        ctx.Db.Enemy.Id.Update(enemy);
    }

    [Reducer]
    public static void DamageEnemy(ReducerContext ctx, int enemyId)
    {
        var enemy = ctx.Db.Enemy.Id.Find(enemyId);

        if (enemy is null) { Log.Warn($"Enemy {enemyId} not found!"); return; }
        if (enemy.IsDead) { Log.Warn($"Enemy is dead and cannot move."); return; }

        var player = ctx.Db.Player.Identity.Find(ctx.Sender);

        if (player is null)
        {
            Log.Warn("cannot damage");
            return;
        }

        enemy.Health -= player.ProjectileInfo.Damage;

        if (enemy.Health <= 0)
        {
            enemy.IsDead = true;
            enemy.Health = 0;
            ctx.Db.Enemy.Id.Update(enemy);
            ctx.Db.Enemy.Delete(enemy);
        }
        else
        {
            ctx.Db.Enemy.Id.Update(enemy);
        }
    }

    [Reducer]
    public static void SpawnEnemy(ReducerContext ctx, int typeId, float posX, float posY, int difficultyMultiplier = 1)
    {
        var world = ctx.Db.World.Id.Find(1);

        float x = posX;
        float y = posY;

        // Random rand = new Random();
        // int edge = rand.Next(0, 4);
        // switch (edge)
        // {
        //     case 0: // Left
        //         x = -world.Width / 2f;
        //         y = (float)(rand.NextDouble() * world.Height - world.Height / 2f);
        //         break;
        //     case 1: // Right
        //         x = world.Width / 2f;
        //         y = (float)(rand.NextDouble() * world.Height - world.Height / 2f);
        //         break;
        //     case 2: // Top
        //         y = world.Height / 2f;
        //         x = (float)(rand.NextDouble() * world.Width - world.Width / 2f);
        //         break;
        //     case 3: // Bottom
        //         y = -world.Height / 2f;
        //         x = (float)(rand.NextDouble() * world.Width - world.Width / 2f);
        //         break;
        // }

        var enemyType = ctx.Db.EnemyType.TypeId.Find(typeId);
        int scaledHealth = (int)(enemyType.MaxHealth * difficultyMultiplier);
        int scaledSpeed = Math.Max(1, (int)(enemyType.Speed * Math.Sqrt(difficultyMultiplier)));
        // int scaledAttack = (int)(enemyType.BaseAttack * difficultyMultiplier);

        var enemy = ctx.Db.Enemy.Insert(new Enemy
        {
            TypeId = typeId,
            ObjectId = GenerateRandomInt(),
            MaxHealth = scaledHealth,
            Health = scaledHealth,
            Speed = scaledSpeed,
            IsDead = false,
            ProjectileInfo = enemyType.ProjectileInfo,
            X = x,
            Y = y
        });

    }

    [Reducer]
    public static void EnemyShootAtClosestPlayer(ReducerContext ctx, int enemyId, float speed)
    {
        var enemy = ctx.Db.Enemy.Id.Find(enemyId);
        if (enemy is null || enemy.IsDead) return;

        // Find closest online player
        Player closestPlayer = null;
        float closestDistance = float.MaxValue;

        float dx = 0;
        float dy = 0;

        foreach (var player in ctx.Db.Player.Iter())
        {
            if (player.IsDead || !player.IsOnline) continue;

            dx = player.X - enemy.X;
            dy = player.Y - enemy.Y;
            float distance = MathF.Sqrt(dx * dx + dy * dy);

            if (distance < closestDistance)
            {
                closestDistance = distance;
                closestPlayer = player;
            }
        }

        if (closestPlayer == null) return; // no valid targets

        // Calculate velocity towards closest player
        float dxTarget = closestPlayer.X - enemy.X;
        float dyTarget = closestPlayer.Y - enemy.Y;
        float dist = MathF.Sqrt(dxTarget * dxTarget + dyTarget * dyTarget);
        if (dist == 0) dist = 0.001f; // avoid division by zero

        float velocityX = (dxTarget / dist) * speed;
        float velocityY = (dyTarget / dist) * speed;

        float angleDeg = MathF.Atan2(dy, dx) * (180 / MathF.PI); // 0° is to the right

        // Log angle for websocket clients
        Log.Info($"Enemy (#{enemy.Id}) fired at closest player (#{closestPlayer.Id}) with angle {MathF.Atan2(dyTarget, dxTarget)} rad");
    }

}
