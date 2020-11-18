using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using api.Models;
using Action = api.Models.Action;

namespace api.Context
{

    public class BmtDbOptions
    {
        public string ConnectionString { get; set; } = "";
        public string InMemDbName { get; set; } = "Bmt";
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
        public DbSet<QuestionTemplate> QuestionTemplates { get; set; }

        private readonly IOptions<BmtDbOptions> _config;

        private bool _isInMemDB = true;

        public BmtDbContext() : base()
        {
            BmtDbOptions options = new BmtDbOptions();
            _config = Options.Create(options);
        }

        public BmtDbContext(IOptions<BmtDbOptions> config) : base()
        {
            _config = config;
            bool hasConnectionString = !string.IsNullOrEmpty(_config.Value.ConnectionString);
            if (hasConnectionString) _isInMemDB = false;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            if (_isInMemDB)
            {
                options.UseInMemoryDatabase(databaseName: _config.Value.InMemDbName);
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

            modelBuilder.Entity<QuestionTemplate>()
                .HasMany(t => t.Questions)
                .WithOne(t => t.QuestionTemplate)
                .HasForeignKey(t => t.QuestionTemplateId);
        }

        public void InitializeIfInMem()
        {
            if (_isInMemDB && this.Database.EnsureCreated())
            {
                this.Projects.AddRange(InitContent.Projects);
                // Adding projects adds all other models
                this.QuestionTemplates.AddRange(InitContent.QuestionTemplates);
                this.SaveChanges();
            }
        }
    }
}
