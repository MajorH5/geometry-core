using SpacetimeDB;
using System;

public static partial class Module
{
    [Table(Name = "enemy", Public = true)]
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

        // Position
        public float X;
        public float Y;
    }

    [Reducer]
    public static void SpawnEnemy(ReducerContext ctx, string name, int health, int speed, int attack, int attackSpeed)
    {
        var enemy = ctx.Db.enemy.Insert(new Enemy
        {
            Name = name,
            Health = health,
            Speed = speed,
            Attack = attack,
            AttackSpeed = attackSpeed,
            IsDead = false,
            X = 0,
            Y = 0
        });

        Log.Info($"Spawned enemy {enemy.Name} (#{enemy.Id}) with {enemy.Health} HP");
    }

    [Reducer]
    public static void MoveEnemy(ReducerContext ctx, int enemyId, float newX, float newY)
    {
        var enemy = ctx.Db.enemy.Id.Find(enemyId);
        if (enemy is null) { Log.Warn($"Enemy {enemyId} not found!"); return; }
        if (enemy.IsDead) { Log.Warn($"{enemy.Name} is dead and cannot move."); return; }

        enemy.X = newX;
        enemy.Y = newY;

        ctx.Db.enemy.Id.Update(enemy);
        Log.Info($"{enemy.Name} moved to ({enemy.X}, {enemy.Y})");
    }

    [Reducer]
    public static void UpdateEnemyHealth(ReducerContext ctx, int enemyId, int amount)
    {
        var enemy = ctx.Db.enemy.Id.Find(enemyId);
        if (enemy is null)
        {
            Log.Warn($"Enemy with ID {enemyId} not found!");
            return;
        }

        if (enemy.IsDead)
        {
            Log.Warn($"{enemy.Name} (#{enemy.Id}) is already dead.");
            return;
        }

        enemy.Health += amount;

        if (enemy.Health <= 0)
        {
            enemy.Health = 0;
            enemy.IsDead = true;
            Log.Info($"{enemy.Name} (#{enemy.Id}) has died!");
        }

        ctx.Db.enemy.Id.Update(enemy);
        Log.Info($"{enemy.Name}'s Health updated to {enemy.Health}");
    }
}
