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
    public static void SpawnEnemy(ReducerContext ctx, int health, int speed, int attack, int attackspeed)
    {
        // Make sure the world exists
        var world = ctx.Db.World.Id.Find(1);
        if (world is null)
        {
            Log.Warn("World not found, cannot spawn enemy.");
            return;
        }

        Random rand = new Random();

        // Choose a random edge: 0=left, 1=right, 2=top, 3=bottom
        int edge = rand.Next(0, 4);
        float x = 0;
        float y = 0;

        switch (edge)
        {
            case 0: // Left
                x = -world.Width / 2f;
                y = (float)(rand.NextDouble() * world.Height - world.Height / 2f);
                break;
            case 1: // Right
                x = world.Width / 2f;
                y = (float)(rand.NextDouble() * world.Height - world.Height / 2f);
                break;
            case 2: // Top
                y = world.Height / 2f;
                x = (float)(rand.NextDouble() * world.Width - world.Width / 2f);
                break;
            case 3: // Bottom
                y = -world.Height / 2f;
                x = (float)(rand.NextDouble() * world.Width - world.Width / 2f);
                break;
        }

        var enemy = ctx.Db.Enemy.Insert(new Enemy
        {
            Health = health,
            Speed = speed,
            Attack = attack,
            AttackSpeed = attackspeed,
            IsDead = false,
            X = x, // spawn location (example)
            Y = y
        });

        Log.Info($"Spawned enemy (#{enemy.Id}) with {enemy.Health} HP");
    }

    [Reducer]
    public static void MoveEnemy(ReducerContext ctx, int enemyId, int newX, int newY)
    {
        var enemy = ctx.Db.Enemy.Id.Find(enemyId);
        if (enemy is null) { Log.Warn($"Enemy {enemyId} not found!"); return; }
        if (enemy.IsDead) { Log.Warn($"Enemy is dead and cannot move."); return; }

        enemy.X = newX;
        enemy.Y = newY;

        ctx.Db.Enemy.Id.Update(enemy);
        Log.Info($" enemy moved to ({enemy.X}, {enemy.Y})");
    }

    [Reducer]
    public static void UpdateEnemyHealth(ReducerContext ctx, int enemyId, int amount)
    {
        var enemy = ctx.Db.Enemy.Id.Find(enemyId);
        if (enemy is null) { Log.Warn($"Enemy with ID {enemyId} not found!"); return; }
        if (enemy.IsDead) { Log.Warn($"Enemy (#{enemy.Id}) is already dead."); return; }

        enemy.Health += amount;
        if (enemy.Health <= 0)
        {
            enemy.Health = 0;
            enemy.IsDead = true;
            Log.Info($"Enemy (#{enemy.Id}) has died!");
        }

        ctx.Db.Enemy.Id.Update(enemy);
        Log.Info($"Enemy's Health updated to {enemy.Health}");
    }
}
