using System;

using Microsoft.EntityFrameworkCore;
using Microsoft.Data.Sqlite;

using api.Authorization;
using api.Context;
using api.Models;

namespace tests
{
    // Class for building and disposing dbcontext for each test
    public abstract class DbContextTestSetup : IDisposable
    {
        protected BmtDbContext _context { get; private set; }
        protected readonly SqliteConnection _connection;

        protected DbContextTestSetup()
        {
            DbContextOptionsBuilder<BmtDbContext> builder = new DbContextOptionsBuilder<BmtDbContext>();
            string connectionString = new SqliteConnectionStringBuilder { DataSource = ":memory:", Cache = SqliteCacheMode.Shared }.ToString();
            _connection = new SqliteConnection(connectionString);
            _connection.Open();
            builder.EnableSensitiveDataLogging();
            builder.UseSqlite(_connection);
            _context = new BmtDbContext(builder.Options);
            _context.Database.EnsureCreated();
            InitContent.PopulateDb(_context);
        }

        public void Dispose()
        {
            _connection.Close();
        }
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
