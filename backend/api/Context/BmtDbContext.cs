using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using api.Models;
using Action = api.Models.Action;

namespace api.Context
{

    public class BmtDbOptions
    {
        public string ConnectionString { get; set; } = "";
    }

    public class BmtDbContext : DbContext
    {
        public DbSet<Project> Projects { get; set; }
        public DbSet<Evaluation> Evaluations { get; set; }
        public DbSet<Participant> Participants { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Answer> Answers { get; set; }
        public DbSet<Action> Actions { get; set; }
        public DbSet<Note> Notes { get; set; }

        private readonly IOptions<BmtDbOptions> _config;

        public BmtDbContext() : base()
        {
            BmtDbOptions options = new BmtDbOptions();
            _config = Options.Create(options);
            this.Initialize();
        }

        public BmtDbContext(IOptions<BmtDbOptions> config) : base()
        {
            _config = config;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            if (string.IsNullOrEmpty(_config.Value.ConnectionString))
            {
                options.UseInMemoryDatabase(databaseName: "Bmt");
            }
            else
            {
                options.UseSqlServer(_config.Value.ConnectionString);
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Project>()
                .HasMany(t => t.Evaluations)
                .WithOne(t => t.Project)
                .HasForeignKey(t => t.ProjectId);

            modelBuilder.Entity<Evaluation>()
                .HasMany(t => t.Participants)
                .WithOne(t => t.Evaluation)
                .HasForeignKey(t => t.EvaluationId);

            modelBuilder.Entity<Evaluation>()
                .HasMany(t => t.Questions)
                .WithOne(t => t.Evaluation)
                .HasForeignKey(t => t.EvaluationId);

            modelBuilder.Entity<Question>()
                .HasMany(t => t.Actions)
                .WithOne(t => t.Question)
                .HasForeignKey(t => t.QuestionId);

            modelBuilder.Entity<Question>()
                .HasMany(t => t.Answers)
                .WithOne(t => t.Question)
                .HasForeignKey(t => t.QuestionId);

            modelBuilder.Entity<Action>()
                .HasMany(t => t.Notes)
                .WithOne(t => t.Action)
                .HasForeignKey(t => t.ActionId);
        }

        private void Initialize()
        {
            if (this.Database.EnsureCreated())
            {
                this.Projects.AddRange(InitContent.Projects);
                this.SaveChangesAsync();
            }
        }
    }
}
