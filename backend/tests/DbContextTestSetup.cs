using System;
using api.Context;

using Microsoft.EntityFrameworkCore;
using Microsoft.Data.Sqlite;

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
            string connectionString = new SqliteConnectionStringBuilder { DataSource = "file::memory:", Cache = SqliteCacheMode.Shared }.ToString();
            _connection = new SqliteConnection(connectionString);
            _connection.Open();

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
}
