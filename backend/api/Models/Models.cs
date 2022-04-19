using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    public class Project
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required]
        public string Id { get; set; }
        [Required]
        public string FusionProjectId { get; set; }
        [Required]
        public DateTimeOffset CreateDate { get; set; }
        [Required]
        public virtual ICollection<Evaluation> Evaluations { get; private set; }
    }

    public class Evaluation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required]
        public string Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public DateTimeOffset CreateDate { get; set; }
        [Required]
        public Progression Progression { get; set; }
        [Required]
        public Status Status { get; set; }
        [Required]
        public virtual ICollection<Participant> Participants { get; private set; }
        [Required]
        public virtual ICollection<Question> Questions { get; private set; }
        [Required]
        public virtual Project Project { get; set; }
        public virtual string Summary { get; set; }
        public virtual string PreviousEvaluationId { get; set; }

        public DateTimeOffset? WorkshopCompleteDate { get; set; }
    }

    public class Participant
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required]
        public string Id { get; set; }
        [Required]
        public string AzureUniqueId { get; set; }
        [Required]
        public Organization Organization { get; set; }
        [Required]
        public Role Role { get; set; }
        [Required]
        public Progression Progression { get; set; }
        [Required]
        public DateTimeOffset CreateDate { get; set; }
        [Required]
        public string EvaluationId { get; set; }
        [Required]
        [ForeignKey("EvaluationId")]
        public virtual Evaluation Evaluation { get; set; }
    }

    public class Question
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required]
        public string Id { get; set; }
        [Required]
        public Organization Organization { get; set; }
        [Required]
        public string Text { get; set; }
        [Required]
        public int Order { get; set; }
        [Required]
        public string SupportNotes { get; set; }
        [Required]
        public Barrier Barrier { get; set; }
        [Required]
        public DateTimeOffset CreateDate { get; set; }
        [Required]
        public virtual ICollection<Answer> Answers { get; private set; }
        [Required]
        public virtual ICollection<Action> Actions { get; private set; }
        [Required]
        public virtual Evaluation Evaluation { get; set; }
        [Required]
        public virtual QuestionTemplate QuestionTemplate { get; set; }
    }

    public class ProjectCategory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required]
        public string Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public ICollection<QuestionTemplate> QuestionTemplates { get; set; }
    }

    public class QuestionTemplate
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required]
        public string Id { get; set; }
        [Required]
        public Status Status { get; set; }
        [Required]
        public Organization Organization { get; set; }
        [Required]
        public string Text { get; set; }
        [Required]
        public int Order { get; set; }
        [Required]
        public int AdminOrder { get; set; }
        [Required]
        public string SupportNotes { get; set; }
        [Required]
        public Barrier Barrier { get; set; }
        [Required]
        public DateTimeOffset CreateDate { get; set; }
        [Required]
        public virtual ICollection<Question> Questions { get; private set; }
        public QuestionTemplate previous { get; set; }
        [Required]
        public ICollection<ProjectCategory> ProjectCategories { get; set; }
    }

    public class Answer
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required]
        public string Id { get; set; }
        [Required]
        public Progression Progression { get; set; }
        [Required]
        public Severity Severity { get; set; }
        [Required]
        public string Text { get; set; }
        [Required]
        public DateTimeOffset CreateDate { get; set; }
        public string AnsweredById { get; set; }
        [ForeignKey("AnsweredById")]
        public Participant AnsweredBy { get; set; }
        [Required]
        public string QuestionId { get; set; }
        [Required]
        [ForeignKey("QuestionId")]
        public virtual Question Question { get; set; }
    }

    public class Action
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required]
        public string Id { get; set; }
        public virtual Participant AssignedTo { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public Priority Priority { get; set; }
        [Required]
        public bool OnHold { get; set; }
        [Required]
        public bool Completed { get; set; }
        [Required]
        public DateTimeOffset DueDate { get; set; }
        [Required]
        public DateTimeOffset CreateDate { get; set; }
        public virtual Participant CreatedBy { get; set; }
        [Required]
        public virtual ICollection<Note> Notes { get; private set; }
        [Required]
        public virtual ICollection<ClosingRemark> ClosingRemarks { get; private set; }
        [Required]
        public virtual Question Question { get; set; }
        [Required]
        public bool IsVoided { get; set; }
    }

    public class Note
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required]
        public string Id { get; set; }
        [Required]
        public string Text { get; set; }
        public Participant CreatedBy { get; set; }
        [Required]
        public DateTimeOffset CreateDate { get; set; }
        [Required]
        public virtual Action Action { get; set; }
    }

    public class ClosingRemark
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required]
        public string Id { get; set; }
        [Required]
        public string Text { get; set; }
        public Participant CreatedBy { get; set; }
        [Required]
        public DateTimeOffset CreateDate { get; set; }
        [Required]
        public virtual Action Action { get; set; }
    }

    public enum Status
    {
        Active, Inactive, Voided
    }

    public enum Progression
    {
        Nomination, Individual, Preparation, Workshop, FollowUp, Finished
    }

    public enum Barrier
    {
        GM, PS1, PS2, PS3, PS4, PS6, PS7, PS12, PS15, PS22
    }

    public enum Organization
    {
        Commissioning, Construction, Engineering, PreOps, All
    }

    public enum Role
    {
        Participant, Facilitator, OrganizationLead
    }

    public enum Severity
    {
        MajorIssues, SomeConcerns, OnTrack, NA
    }

    public enum Priority
    {
        Low, Medium, High
    }
}
