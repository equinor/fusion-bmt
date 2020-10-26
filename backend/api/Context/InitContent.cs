using System;
using System.Collections.Generic;

using api.Models;
using Action = api.Models.Action;

namespace api.Context
{
    static class InitContent
    {
        public static readonly List<Project> Projects = GetProjects();
        public static readonly List<Evaluation> Evaluations = GetEvaluations();
        public static readonly List<Participant> Participants = GetParticipants();
        public static readonly List<Question> Questions = GetQuestions();
        public static readonly List<Answer> Answers = GetAnswers();
        public static readonly List<Action> Actions = GetActions();
        public static readonly List<Note> Notes = GetNotes();

        private static List<Note> GetNotes()
        {
            var participant1 = GetParticipants()[0];
            var participant2 = GetParticipants()[1];
            var note1 = new Note
            {
                Text = "Note1",
                CreateDate = DateTime.UtcNow,
                CreatedBy = participant1
            };
            var note2 = new Note
            {
                Text = "Note2",
                CreateDate = DateTime.UtcNow,
                CreatedBy = participant2
            };
            return new List<Note>(new Note[] { note1, note2 });
        }

        private static List<Action> GetActions()
        {
            var participant1 = GetParticipants()[0];
            var participant2 = GetParticipants()[1];
            var notes = GetNotes();

            var action1 = new Action
            {
                AssignedTo = participant1,
                Title = "Action1",
                Description = "Description",
                Priority = Priority.High,
                OnHold = false,
                DueDate = DateTime.UtcNow,
                CreateDate = DateTime.UtcNow,
                CreatedBy = participant1,
                Notes = notes
            };
            var action2 = new Action
            {
                AssignedTo = participant2,
                Title = "Action2",
                Description = "Description",
                Priority = Priority.Medium,
                OnHold = false,
                DueDate = DateTime.UtcNow,
                CreateDate = DateTime.UtcNow,
                CreatedBy = participant1,
                Notes = notes
            };
            return new List<Action>(new Action[] { action1, action2 });
        }

        private static List<Answer> GetAnswers()
        {
            var participant1 = GetParticipants()[0];
            var participant2 = GetParticipants()[1];
            var answer1 = new Answer
            {
                Progression = Progression.Preparation,
                Severity = Severity.High,
                Text = "Answer1",
                CreateDate = DateTime.UtcNow,
                AnsweredBy = participant1
            };
            var answer2 = new Answer
            {
                Progression = Progression.FollowUp,
                Severity = Severity.Limited,
                Text = "Answer2",
                CreateDate = DateTime.UtcNow,
                AnsweredBy = participant2
            };
            var answer3 = new Answer
            {
                Progression = Progression.Alignment,
                Severity = Severity.Low,
                Text = "Answer3",
                CreateDate = DateTime.UtcNow,
                AnsweredBy = participant2
            };
            return new List<Answer>(new Answer[] { answer1, answer2, answer3 });
        }

        private static List<Question> GetQuestions()
        {
            var actions = GetActions();

            var answers1 = GetAnswers().GetRange(0, 2);
            var answers2 = GetAnswers().GetRange(1, 2);

            var qeustion1 = new Question
            {
                Status = Status.Active,
                Organization = Organization.Engineering,
                Text = "Question1",
                SupportNotes = "SupportNotes1",
                Barrier = Barrier.GM,
                CreateDate = DateTime.UtcNow,
                Answers = answers1,
                Actions = actions
            };
            var qeustion2 = new Question
            {
                Status = Status.Active,
                Organization = Organization.Commissioning,
                SupportNotes = "SupportNotes2",
                Text = "Question2",
                Barrier = Barrier.PS2,
                CreateDate = DateTime.UtcNow,
                Answers = answers2,
                Actions = actions
            };
            var qeustion3 = new Question
            {
                Status = Status.Active,
                Organization = Organization.Commissioning,
                SupportNotes = "SupportNotes3",
                Text = "Question3",
                Barrier = Barrier.PS3,
                CreateDate = DateTime.UtcNow,
                Answers = answers2,
                Actions = actions
            };
            var qeustion4 = new Question
            {
                Status = Status.Active,
                Organization = Organization.Commissioning,
                SupportNotes = "SupportNotes4",
                Text = "Question4",
                Barrier = Barrier.PS4,
                CreateDate = DateTime.UtcNow,
                Answers = answers1,
                Actions = actions
            };
            return new List<Question>(new Question[] { qeustion1, qeustion2, qeustion3, qeustion4 });
        }

        private static List<Evaluation> GetEvaluations()
        {
            var participants = GetParticipants();
            var participant1 = GetParticipants()[0];
            var participant2 = GetParticipants()[1];

            var questions1 = GetQuestions().GetRange(0, 2);
            var questions2 = GetQuestions().GetRange(2, 2);

            var evaluation1 = new Evaluation
            {
                Name = "Evaluation1",
                CreateDate = DateTime.UtcNow,
                Progression = Progression.Nomination,
                Participants = participants,
                Questions = questions1
            };
            var evaluation2 = new Evaluation
            {
                Name = "Evaluation2",
                CreateDate = DateTime.UtcNow,
                Progression = Progression.Preparation,
                Participants = participants,
                Questions = questions2
            };
            var evaluation3 = new Evaluation
            {
                Name = "Evaluation3",
                CreateDate = DateTime.UtcNow,
                Progression = Progression.Alignment,
                Participants = participants,
                Questions = questions1
            };
            var evaluation4 = new Evaluation
            {
                Name = "Evaluation4",
                CreateDate = DateTime.UtcNow,
                Progression = Progression.Workshop,
                Participants = participants,
                Questions = questions2
            };
            return new List<Evaluation>(new Evaluation[] { evaluation1, evaluation2, evaluation3, evaluation4 });

        }

        private static List<Participant> GetParticipants()
        {
            var participant1 = new Participant
            {
                FusionPersonId = "1",
                Organization = Organization.Engineering,
                Role = Role.Facilitator,
                CreateDate = DateTime.UtcNow
            };
            var participant2 = new Participant
            {
                FusionPersonId = "2",
                Organization = Organization.Construction,
                Role = Role.Participant,
                CreateDate = DateTime.UtcNow
            };
            return new List<Participant>(new Participant[] { participant1, participant2 });
        }
        private static List<Project> GetProjects()
        {

            var evaluations1 = GetEvaluations().GetRange(0, 2);
            var evaluations2 = GetEvaluations().GetRange(2, 2);

            var project1 = new Project
            {
                FusionProjectId = "1",
                CreateDate = DateTime.UtcNow,
                Evaluations = evaluations1
            };
            var project2 = new Project
            {
                FusionProjectId = "2",
                CreateDate = DateTime.UtcNow,
                Evaluations = evaluations2
            };

            List<Project> projects = new List<Project>(new Project[] { project1, project2 });

            return projects;
        }
    }
}
