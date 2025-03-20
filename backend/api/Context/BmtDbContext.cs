using Microsoft.EntityFrameworkCore;
using api.Models;
using Action = api.Models.Action;

namespace api.Context;

public class BmtDbContext(DbContextOptions<BmtDbContext> options) : DbContext(options)
{
    public DbSet<Project> Projects { get; set; }
    public DbSet<Evaluation> Evaluations { get; set; }
    public DbSet<Participant> Participants { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Answer> Answers { get; set; }
    public DbSet<Action> Actions { get; set; }
    public DbSet<Note> Notes { get; set; }
    public DbSet<ClosingRemark> ClosingRemarks { get; set; }
    public DbSet<QuestionTemplate> QuestionTemplates { get; set; }
    public DbSet<ProjectCategory> ProjectCategories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Project>().HasIndex(p => p.IndicatorEvaluationId).IsUnique();
        modelBuilder.Entity<Answer>().HasIndex(q => q.Severity);
        modelBuilder.Entity<Participant>().HasIndex(p => new { p.AzureUniqueId, p.EvaluationId }).IsUnique();
        modelBuilder.Entity<Answer>().HasIndex(a => new { a.QuestionId, a.AnsweredById, a.Progression }).IsUnique();
    }
}