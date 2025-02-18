using api.Context;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace api.AppInfrastructure;

public static class BmtDatabaseConfiguration
{
    public static void ConfigureBmtDatabase(this WebApplicationBuilder builder)
    {
        if (BmtEnvironments.UseSqlite)
        {
            SetupSqliteDatabase(builder);

            return;
        }

        SetupAzureDatabase(builder);
    }

    private static void SetupSqliteDatabase(WebApplicationBuilder builder)
    {
        var dbContextOptionsBuilder = new DbContextOptionsBuilder<BmtDbContext>();

        var sqliteConnectionString = new SqliteConnectionStringBuilder
        {
            DataSource = "file::memory:",
            Mode = SqliteOpenMode.ReadWriteCreate,
            Cache = SqliteCacheMode.Shared
        }
            .ToString();

        var sqliteConnection = new SqliteConnection(sqliteConnectionString);
        sqliteConnection.Open();
        dbContextOptionsBuilder.UseSqlite(sqliteConnection);

        using var context = new BmtDbContext(dbContextOptionsBuilder.Options);
        context.Database.EnsureCreated();

        builder.Services.AddDbContext<BmtDbContext>(
            options => options
                .UseSqlite(sqliteConnectionString, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

        builder.Services.AddDbContextFactory<BmtDbContext>(
            options => options
                .UseSqlite(sqliteConnectionString, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)),
            lifetime: ServiceLifetime.Scoped);
    }

    private static void SetupAzureDatabase(WebApplicationBuilder builder)
    {
        var sqlServerConnectionString = builder.Configuration["Db:ConnectionString"]!;

        builder.Services.AddDbContext<BmtDbContext>(
            options => options
                .UseSqlServer(sqlServerConnectionString, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

        builder.Services.AddDbContextFactory<BmtDbContext>(
            options => options
                .UseSqlServer(sqlServerConnectionString, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)),
            lifetime: ServiceLifetime.Scoped);

        if (!BmtEnvironments.AllowMigrationsToBeApplied)
        {
            return;
        }

        var dbBuilder = new DbContextOptionsBuilder<BmtDbContext>();
        dbBuilder.UseSqlServer(sqlServerConnectionString);
        using var context = new BmtDbContext(dbBuilder.Options);

        // context.Database.Migrate();
    }
}
