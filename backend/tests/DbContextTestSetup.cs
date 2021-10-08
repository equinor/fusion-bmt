using System;

using Microsoft.EntityFrameworkCore;
using Microsoft.Data.Sqlite;

using api.Authorization;
using api.Context;
using api.Models;
using Xunit;

namespace tests
{
    // Class for building and disposing dbcontext
    public class DatabaseFixture : IDisposable
    {
        public BmtDbContext context { get; private set; }
        private readonly SqliteConnection _connection;

        public DatabaseFixture()
        {
            DbContextOptionsBuilder<BmtDbContext> builder = new DbContextOptionsBuilder<BmtDbContext>();
            string connectionString = new SqliteConnectionStringBuilder { DataSource = ":memory:", Cache = SqliteCacheMode.Shared }.ToString();
            _connection = new SqliteConnection(connectionString);
            _connection.Open();
            builder.EnableSensitiveDataLogging();
            builder.UseSqlite(_connection);
            context = new BmtDbContext(builder.Options);
            context.Database.EnsureCreated();
            InitContent.PopulateDb(context);
        }

        public void Dispose()
        {
            _connection.Close();
        }
    }

    [CollectionDefinition("Database collection")]
    public class DatabaseCollection : ICollectionFixture<DatabaseFixture>
    {
        // This class has no code, and is never created. Its purpose is simply
        // to be the place to apply [CollectionDefinition] and all the
        // ICollectionFixture<> interfaces.
    }

    public class MockAuthService : IAuthService
    {
        private string _loggedInUser = "1";

        public void LoginUser(string azureUniqueId)
        {
            _loggedInUser = azureUniqueId;
        }

        public void LoginUser(Participant participant)
        {
            _loggedInUser = participant.AzureUniqueId;
        }

        public string GetOID()
        {
            return _loggedInUser;
        }
    }
}
