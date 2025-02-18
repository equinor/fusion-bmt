using System.Text.Json;
using api.Models;
using api.Utils;
using Microsoft.EntityFrameworkCore;
using Action = api.Models.Action;

namespace api.Context
{
    public static class InitContent
    {
        public static readonly List<QuestionTemplate> QuestionTemplates = GetQuestionTemplates();
        public static readonly List<ProjectCategory> ProjectCategories = GetProjectCategories();
        public static readonly List<Project> Projects = GetProjects();
        public static readonly List<Evaluation> Evaluations = GetEvaluations();
        public static readonly List<Participant> Participants = GetParticipants();
        public static readonly List<Question> Questions = GetQuestions();
        public static readonly List<Answer> Answers = GetAnswers();
        public static readonly List<Action> Actions = GetActions();
        public static readonly List<Note> Notes = GetNotes();
        public static readonly List<ClosingRemark> ClosingRemarks = GetClosingRemarks();

        private static List<QuestionTemplate> GetQuestionTemplates()
        {
            string pathJsonRelativeToApiRoot = "Context/InitQuestions.json";
            List<QuestionTemplate> questions;
            using (StreamReader reader = new StreamReader(pathJsonRelativeToApiRoot))
            {
                string json = reader.ReadToEnd();
                questions = JsonSerializer.Deserialize<List<QuestionTemplate>>(json, JsonUtils.SerializerOptions);
            }
            int order = 1;
            foreach (QuestionTemplate q in questions)
            {
                q.CreateDate = DateTimeOffset.UtcNow;
                q.Status = Status.Active;
                q.Order = order;
                q.AdminOrder = order;

                order += 1;
            }
            return questions;
        }

        private static List<Note> GetNotes()
        {
            var note1 = new Note
            {
                Text = "Note1",
                CreateDate = DateTimeOffset.UtcNow,
                Action = Actions[0],
                CreatedBy = Participants[0]
            };
            var note2 = new Note
            {
                Text = "Note2",
                CreateDate = DateTimeOffset.UtcNow,
                Action = Actions[0],
                CreatedBy = Participants[0]
            };
            return new List<Note>(new Note[] { note1, note2 });
        }

        private static List<ClosingRemark> GetClosingRemarks()
        {
            var closingRemark1 = new ClosingRemark
            {
                Text = "ClosingRemark1",
                CreateDate = DateTimeOffset.UtcNow,
                Action = Actions[0],
                CreatedBy = Participants[0]
            };
            var closingRemark2 = new ClosingRemark
            {
                Text = "ClosingRemark2",
                CreateDate = DateTimeOffset.UtcNow,
                Action = Actions[0],
                CreatedBy = Participants[0]
            };
            return new List<ClosingRemark>(new ClosingRemark[] { closingRemark1, closingRemark2 });
        }

        private static List<Action> GetActions()
        {
            var action1 = new Action
            {
                Title = "Action1",
                Description = "Description",
                Priority = Priority.High,
                OnHold = false,
                Completed = false,
                DueDate = DateTimeOffset.UtcNow,
                CreateDate = DateTimeOffset.UtcNow,
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
                Completed = false,
                DueDate = DateTimeOffset.UtcNow,
                CreateDate = DateTimeOffset.UtcNow,
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
                Progression = Progression.Individual,
                Severity = Severity.OnTrack,
                Text = "Answer1",
                CreateDate = DateTimeOffset.UtcNow,
                Question = Questions[1],
                AnsweredBy = Participants[0]
            };
            var answer2 = new Answer
            {
                Progression = Progression.FollowUp,
                Severity = Severity.SomeConcerns,
                Text = "Answer2",
                CreateDate = DateTimeOffset.UtcNow,
                Question = Questions[2],
                AnsweredBy = Participants[0]
            };
            var answer3 = new Answer
            {
                Progression = Progression.Preparation,
                Severity = Severity.MajorIssues,
                Text = "Answer3",
                CreateDate = DateTimeOffset.UtcNow,
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
                    Order = questionTemplate.Order,
                    SupportNotes = questionTemplate.SupportNotes,
                    Organization = questionTemplate.Organization,
                    QuestionTemplate = questionTemplate,
                    CreateDate = DateTimeOffset.UtcNow,
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
                CreateDate = DateTimeOffset.UtcNow,
                Progression = Progression.Nomination,
                Project = Projects[0],
                Status = Status.Active
            };
            var evaluation2 = new Evaluation
            {
                Name = "Evaluation2",
                CreateDate = DateTimeOffset.UtcNow,
                Progression = Progression.Individual,
                Project = Projects[0],
                Status = Status.Active
            };
            var evaluation3 = new Evaluation
            {
                Name = "Evaluation3",
                CreateDate = DateTimeOffset.UtcNow,
                Progression = Progression.Preparation,
                Project = Projects[1],
                Status = Status.Active
            };
            var evaluation4 = new Evaluation
            {
                Name = "Evaluation4",
                CreateDate = DateTimeOffset.UtcNow,
                Progression = Progression.Workshop,
                Project = Projects[1],
                Status = Status.Active
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
                CreateDate = DateTimeOffset.UtcNow,
                Progression = Progression.Nomination,
                Evaluation = Evaluations[0]
            };
            var participant2 = new Participant
            {
                AzureUniqueId = "2",
                Organization = Organization.Engineering,
                Role = Role.Facilitator,
                CreateDate = DateTimeOffset.UtcNow,
                Progression = Progression.Individual,
                Evaluation = Evaluations[1]
            };
            var participant3 = new Participant
            {
                AzureUniqueId = "3",
                Organization = Organization.Construction,
                Role = Role.Participant,
                CreateDate = DateTimeOffset.UtcNow,
                Progression = Progression.Individual,
                Evaluation = Evaluations[1]
            };
            return new List<Participant>(new Participant[] { participant1, participant2, participant3 });
        }

        private static List<Project> GetProjects()
        {
            var project1 = new Project
            {
                FusionProjectId = "1",
                ExternalId = "1",
                CreateDate = DateTimeOffset.UtcNow
            };
            var project2 = new Project
            {
                FusionProjectId = "2",
                ExternalId = "2",
                CreateDate = DateTimeOffset.UtcNow
            };

            List<Project> projects = new List<Project>(new Project[] { project1, project2 });

            return projects;
        }

        private static List<ProjectCategory> GetProjectCategories()
        {
            var category1 = new ProjectCategory
            {
                Name = "CircleField"
            };

            var category2 = new ProjectCategory
            {
                Name = "SquareField"
            };

            return new List<ProjectCategory> { category1, category2 };
        }

        public static void PopulateDb(BmtDbContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            context.AddRange(Projects);
            context.AddRange(ProjectCategories);
            context.AddRange(QuestionTemplates);
            context.AddRange(Evaluations);
            context.AddRange(Participants);
            context.AddRange(Questions);
            context.AddRange(Answers);
            context.AddRange(Actions);
            context.AddRange(Notes);
            context.AddRange(ClosingRemarks);

            context.SaveChanges();

            var templates = context.QuestionTemplates.Include(x => x.ProjectCategories);
            var categories = context.ProjectCategories;
            int qCounter = 0;
            foreach (var template in templates)
            {
                qCounter++;
                foreach (var category in categories)
                {
                    template.ProjectCategories.Add(category);
                    if (qCounter % 2 == 1)
                    {
                        break;
                    }
                }
            }
            context.SaveChanges();
        }
    }
}
