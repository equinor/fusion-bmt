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
        public string Id { get; set; }
        public string FusionProjectId { get; set; }
        public DateTime CreateDate { get; set; }
        public virtual ICollection<Evaluation> Evaluations { get; set; }
    }

    public class Evaluation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public string Name { get; set; }
        public string ProjectId { get; set; }
        public DateTime CreateDate { get; set; }
        public Progression? Progression { get; set; }
        public virtual ICollection<Participant> Participants { get; set; }
        public virtual ICollection<Question> Questions { get; set; }
        public virtual Project Project { get; set; }
    }

    public class Participant
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public string EvaluationId { get; set; }
        public string FusionPersonId { get; set; }
        public Organization? Organization { get; set; }
        public Role? Role { get; set; }
        public DateTime CreateDate { get; set; }
        public virtual Evaluation Evaluation { get; set; }
    }

    public class Question
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public string EvaluationId { get; set; }
        public Status? Status { get; set; }
        public Organization? Organization { get; set; }
        public string Text { get; set; }
        public string SupportNotes { get; set; }
        public Barrier? Barrier { get; set; }
        public DateTime CreateDate { get; set; }
        public virtual ICollection<Answer> Answers { get; set; }
        public virtual ICollection<Action> Actions { get; set; }
        public virtual Evaluation Evaluation { get; set; }
    }

    public class Answer
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public string QuestionId { get; set; }
        public Progression? Progression { get; set; }
        public Severity? Severity { get; set; }
        public string Text { get; set; }
        public DateTime CreateDate { get; set; }
        public Participant AnsweredBy { get; set; }
        public virtual Question Question { get; set; }
    }

    public class Action
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public string QuestionId { get; set; }
        public Participant AssignedTo { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public Priority? Priority { get; set; }
        public bool OnHold { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime CreateDate { get; set; }
        public Participant CreatedBy { get; set; }
        public virtual ICollection<Note> Notes { get; set; }
        public virtual Question Question { get; set; }
    }

    public class Note
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public string ActionId { get; set; }
        public string Text { get; set; }
        public Participant CreatedBy { get; set; }
        public DateTime CreateDate { get; set; }
        public virtual Action Action { get; set; }
    }

    public enum Status
    {
        Active, Inactive
    }

    public enum Progression
    {
        Nomination, Preparation, Alignment, Workshop, FollowUp
    }

    public enum Barrier
    {
        GM, PS1, PS2, PS3, PS4, PS5, PS6, PS7, PS12, PS15, PS22
    }

    public enum Organization
    {
        Commissioning, Construction, Engineering, PreOps, All
    }

    public enum Role
    {
        Participant, Facilitator, ReadOnly
    }

    public enum Severity
    {
        Low, Limited, High, NA
    }

    public enum Priority
    {
        Low, Medium, High
    }
}
