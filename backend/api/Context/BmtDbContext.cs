using Microsoft.EntityFrameworkCore;

using api.Models;

namespace api.Context
{
    public class BmtDbContext : DbContext
    {
        public DbSet<Project> Projects { get; set; }
        public DbSet<Evaluation> Evaluations { get; set; }
        public DbSet<Participant> Participants { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Answer> Answers { get; set; }
        public DbSet<Action> Actions { get; set; }
        public DbSet<Note> Notes { get; set; }

        public BmtDbContext() : base()
        {
            this.Initialise();
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            options.UseInMemoryDatabase(databaseName: "Bmt");
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

            modelBuilder.Entity<Evaluation>()
                .HasMany(t => t.Actions)
                .WithOne(t => t.Evaluation)
                .HasForeignKey(t => t.EvaluationId);

            modelBuilder.Entity<Question>()
                .HasMany(t => t.Answers)
                .WithOne(t => t.Question)
                .HasForeignKey(t => t.QuestionId);

            modelBuilder.Entity<Action>()
                .HasMany(t => t.Notes)
                .WithOne(t => t.Action)
                .HasForeignKey(t => t.ActionId);
        }

        private void Initialise()
        {
            if (this.Database.EnsureCreated())
            {
                this.Projects.Add(InitContent.Project);
                this.SaveChangesAsync();
            }
        }
    }
}
