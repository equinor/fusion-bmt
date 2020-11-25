using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

using api.Models;
using api.Utils;
using Action = api.Models.Action;

namespace api.Context
{
    public static class InitContent
    {
        public static readonly List<Project> Projects = GetProjects();
        public static readonly List<QuestionTemplate> QuestionTemplates = GetQuestionTemplates();
        public static readonly List<Evaluation> Evaluations = GetEvaluations();
        public static readonly List<Participant> Participants = GetParticipants();
        public static readonly List<Question> Questions = GetQuestions();
        public static readonly List<Answer> Answers = GetAnswers();
        public static readonly List<Action> Actions = GetActions();
        public static readonly List<Note> Notes = GetNotes();

        private static List<QuestionTemplate> GetQuestionTemplates()
        {
            string pathJsonRelativeToApiRoot = "Context/InitQuestions.json";
            List<QuestionTemplate> questions;
            using (StreamReader reader = new StreamReader(pathJsonRelativeToApiRoot))
            {
                string json = reader.ReadToEnd();
                questions = JsonSerializer.Deserialize<List<QuestionTemplate>>(json, JsonUtils.SerializerOptions);
            }
            foreach (QuestionTemplate q in questions)
            {
                q.CreateDate = DateTime.UtcNow;
                q.Status = Status.Active;
            }
            return questions;
        }

        private static List<Note> GetNotes()
        {
            var note1 = new Note
            {
                Text = "Note1",
                CreateDate = DateTime.UtcNow,
                Action = Actions[0],
                CreatedBy = Participants[0]
            };
            var note2 = new Note
            {
                Text = "Note2",
                CreateDate = DateTime.UtcNow,
                Action = Actions[0],
                CreatedBy = Participants[0]
            };
            return new List<Note>(new Note[] { note1, note2 });
        }

        private static List<Action> GetActions()
        {
            var action1 = new Action
            {
                Title = "Action1",
                Description = "Description",
                Priority = Priority.High,
                OnHold = false,
                DueDate = DateTime.UtcNow,
                CreateDate = DateTime.UtcNow,
                AssignedTo = Participants[0],
                CreatedBy = Participants[0],
                Question = Questions[0]
            };
            var action2 = new Action
            {
                Title = "Action2",
                Description = "Description",
                Priority = Priority.Medium,
                OnHold = false,
                DueDate = DateTime.UtcNow,
                CreateDate = DateTime.UtcNow,
                AssignedTo = Participants[0],
                CreatedBy = Participants[0],
                Question = Questions[0]
            };
            return new List<Action>(new Action[] { action1, action2 });
        }

        private static List<Answer> GetAnswers()
        {
            var answer1 = new Answer
            {
                Progression = Progression.Preparation,
                Severity = Severity.High,
                Text = "Answer1",
                CreateDate = DateTime.UtcNow,
                Question = Questions[1],
                AnsweredBy = Participants[0]
            };
            var answer2 = new Answer
            {
                Progression = Progression.FollowUp,
                Severity = Severity.Limited,
                Text = "Answer2",
                CreateDate = DateTime.UtcNow,
                Question = Questions[2],
                AnsweredBy = Participants[0]
            };
            var answer3 = new Answer
            {
                Progression = Progression.Alignment,
                Severity = Severity.Low,
                Text = "Answer3",
                CreateDate = DateTime.UtcNow,
                Question = Questions[3],
                AnsweredBy = Participants[0]
            };
            return new List<Answer>(new Answer[] { answer1, answer2, answer3 });
        }

        private static List<Question> GetQuestions()
        {
            List<Question> questions = new List<Question>();
            foreach (QuestionTemplate questionTemplate in QuestionTemplates)
            {
                questions.Add(new Question
                {
                    Barrier = questionTemplate.Barrier,
                    Text = questionTemplate.Text,
                    SupportNotes = questionTemplate.SupportNotes,
                    Organization = questionTemplate.Organization,
                    QuestionTemplate = questionTemplate,
                    CreateDate = DateTime.UtcNow,
                    Evaluation = Evaluations[0]
                });
            }

            return questions;
        }

        private static List<Evaluation> GetEvaluations()
        {
            var evaluation1 = new Evaluation
            {
                Name = "Evaluation1",
                CreateDate = DateTime.UtcNow,
                Progression = Progression.Nomination,
                Project = Projects[0]
            };
            var evaluation2 = new Evaluation
            {
                Name = "Evaluation2",
                CreateDate = DateTime.UtcNow,
                Progression = Progression.Preparation,
                Project = Projects[0]
            };
            var evaluation3 = new Evaluation
            {
                Name = "Evaluation3",
                CreateDate = DateTime.UtcNow,
                Progression = Progression.Alignment,
                Project = Projects[1]
            };
            var evaluation4 = new Evaluation
            {
                Name = "Evaluation4",
                CreateDate = DateTime.UtcNow,
                Progression = Progression.Workshop,
                Project = Projects[1]
            };

            return new List<Evaluation>(new Evaluation[] { evaluation1, evaluation2, evaluation3, evaluation4 });
        }

        private static List<Participant> GetParticipants()
        {
            var participant1 = new Participant
            {
                AzureUniqueId = "1",
                Organization = Organization.Construction,
                Role = Role.Participant,
                CreateDate = DateTime.UtcNow,
                Evaluation = Evaluations[0]
            };
            var participant2 = new Participant
            {
                AzureUniqueId = "2",
                Organization = Organization.Engineering,
                Role = Role.Facilitator,
                CreateDate = DateTime.UtcNow,
                Evaluation = Evaluations[1]
            };
            var participant3 = new Participant
            {
                AzureUniqueId = "3",
                Organization = Organization.Construction,
                Role = Role.Participant,
                CreateDate = DateTime.UtcNow,
                Evaluation = Evaluations[1]
            };
            return new List<Participant>(new Participant[] { participant1, participant2, participant3 });
        }

        private static List<Project> GetProjects()
        {
            var project1 = new Project
            {
                FusionProjectId = "1",
                CreateDate = DateTime.UtcNow
            };
            var project2 = new Project
            {
                FusionProjectId = "2",
                CreateDate = DateTime.UtcNow
            };

            List<Project> projects = new List<Project>(new Project[] { project1, project2 });

            return projects;
        }

        public static void PopulateDb(BmtDbContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            context.AddRange(Projects);
            context.AddRange(QuestionTemplates);
            context.AddRange(Evaluations);
            context.AddRange(Participants);
            context.AddRange(Questions);
            context.AddRange(Answers);
            context.AddRange(Actions);
            context.AddRange(Notes);

            context.SaveChanges();
        }
    }
}
