using SpacetimeDB;

public static partial class Module
{
    [SpacetimeDB.Table]
    public partial struct Enemy
    {
        [SpacetimeDB.AutoInc]
        [SpacetimeDB.PrimaryKey]
        public int Id;

        public string Name;
        public int Health;
        public int Speed;
        public int Attack;
        public int AttackSpeed;
        public bool IsDead;


        // Position
        public float X;
        public float Y;
    }

    [SpacetimeDB.Reducer]
    public static void SpawnEnemy(ReducerContext ctx, string name, int health, int speed, int attack, int attackSpeed)
    {
        var enemy = ctx.Db.Enemy.Insert(new Enemy
        {
            Name = name,
            Health = health,
            Speed = speed,
            Attack = attack,
            AttackSpeed = attackSpeed,
            IsDead = false
        });

        Log.Info($"Spawned enemy {enemy.Name} (#{enemy.Id}) with {enemy.Health} HP");
    }

    [SpacetimeDB.Reducer]
    public static void MoveEnemy(ReducerContext ctx, int enemyId, float newX, float newY)
    {
        var enemyOpt = ctx.Db.Enemy.Get(enemyId);
        if (enemyOpt == null) { Log.Warn($"Enemy {enemyId} not found!"); return; }
        var enemy = enemyOpt.Value;

        enemy.X = newX;
        enemy.Y = newY;
        ctx.Db.Enemy.Update(enemy);
    }

    [SpacetimeDB.Reducer]
    public static void UpdateEnemyHealth(ReducerContext ctx, int enemyId, int amount)
    {
        var enemy = ctx.Db.Enemy.Get(enemyId);
        if (enemy == null)
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

        ctx.Db.Enemy.Update(enemy);
    }
}
