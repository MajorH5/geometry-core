using SpacetimeDB;
using System;
using System.Collections.Generic;

public static partial class Module
{
    // ---------------- Enemy Table ----------------
    [Table(Name = "Enemy", Public = true)]
    public partial class Enemy
    {
        [AutoInc]
        [PrimaryKey]
        public int Id;

        public string Name = "";
        public int Health;
        public int Speed;
        public int Attack;
        public int AttackSpeed;
        public bool IsDead;

        // Position on grid
        public float X;
        public float Y;
    }

    // ---------------- Reducers ----------------

    [Reducer]
    public static void SpawnEnemy(ReducerContext ctx, string name, int health, int speed, int attack, int attackSpeed, float x, float y)
    {
        // Make sure the world exists
        var world = ctx.Db.World.Id.Find(1);
        if (world is null)
        {
            Log.Warn("World not found, cannot spawn enemy.");
            return;
        }

        // Clamp spawn position to world bounds
        float spawnX = Math.Clamp(x, -world.Width / 2f, world.Width / 2f);
        float spawnY = Math.Clamp(y, -world.Height / 2f, world.Height / 2f);

        var enemy = ctx.Db.Enemy.Insert(new Enemy
        {
            Name = name,
            Health = health,
            Speed = speed,
            Attack = attack,
            AttackSpeed = attackSpeed,
            IsDead = false,
            X = x, // spawn location (example)
            Y = y
        });

        Log.Info($"Spawned enemy {enemy.Name} (#{enemy.Id}) with {enemy.Health} HP");
    }

    [Reducer]
    public static void MoveEnemy(ReducerContext ctx, int enemyId, int newX, int newY)
    {
        var enemy = ctx.Db.Enemy.Id.Find(enemyId);
        if (enemy is null) { Log.Warn($"Enemy {enemyId} not found!"); return; }
        if (enemy.IsDead) { Log.Warn($"{enemy.Name} is dead and cannot move."); return; }

        enemy.X = newX;
        enemy.Y = newY;

        ctx.Db.Enemy.Id.Update(enemy);
        Log.Info($"{enemy.Name} moved to ({enemy.X}, {enemy.Y})");
    }

    [Reducer]
    public static void UpdateEnemyHealth(ReducerContext ctx, int enemyId, int amount)
    {
        var enemy = ctx.Db.Enemy.Id.Find(enemyId);
        if (enemy is null) { Log.Warn($"Enemy with ID {enemyId} not found!"); return; }
        if (enemy.IsDead) { Log.Warn($"{enemy.Name} (#{enemy.Id}) is already dead."); return; }

        enemy.Health += amount;
        if (enemy.Health <= 0)
        {
            enemy.Health = 0;
            enemy.IsDead = true;
            Log.Info($"{enemy.Name} (#{enemy.Id}) has died!");
        }

        ctx.Db.Enemy.Id.Update(enemy);
        Log.Info($"{enemy.Name}'s Health updated to {enemy.Health}");
    }
}
