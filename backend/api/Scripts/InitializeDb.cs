using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System.Collections.Generic;
using System;
using Action = api.Models.Action;

using api.Context;
using api.Models;

namespace api.Scripts
{
    public static class Initialize
    {
        public static void InitializeDatabase(IApplicationBuilder app)
        {
            using (var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
            {
                var context = serviceScope.ServiceProvider.GetRequiredService<BmtDbContext>();
                if (context.Database.EnsureCreated())
                {
                    var participant1 = new Participant
                    {
                        FusionPersonId = "1",
                        Discipline = Discipline.Engineering,
                        Role = Role.Facilitator,
                        CreateDate = DateTime.UtcNow
                    };
                    var participant2 = new Participant
                    {
                        FusionPersonId = "2",
                        Discipline = Discipline.Construction,
                        Role = Role.Participant,
                        CreateDate = DateTime.UtcNow
                    };
                    var participants = new List<Participant>(new Participant[] { participant1, participant2 });

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
                    var notes = new List<Note>(new Note[] { note1, note2 });

                    var action = new Action
                    {
                        AssignedTo = participant1,
                        Title = "Title",
                        Description = "Description",
                        Priority = Priority.High,
                        OnHold = false,
                        DueDate = DateTime.UtcNow,
                        CreateDate = DateTime.UtcNow,
                        CreatedBy = participant1,
                        Notes = notes
                    };

                    var actions = new List<Action>(new Action[] { action });

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
                    var answers1 = new List<Answer>(new Answer[] { answer1, answer2 });
                    var answers2 = new List<Answer>(new Answer[] { answer2, answer3 });

                    var qeustion1 = new Question
                    {
                        Status = Status.Active,
                        Discipline = Discipline.Engineering,
                        Text = "Question1",
                        Barrier = Barrier.GM,
                        CreateDate = DateTime.UtcNow,
                        Answers = answers1
                    };
                    var qeustion2 = new Question
                    {
                        Status = Status.Active,
                        Discipline = Discipline.Commissioning,
                        Text = "Question2",
                        Barrier = Barrier.PS1,
                        CreateDate = DateTime.UtcNow,
                        Answers = answers2
                    };
                    var questions = new List<Question>(new Question[] { qeustion1, qeustion2 });

                    var evaluation = new Evaluation
                    {
                        CreateDate = DateTime.UtcNow,
                        Progression = Progression.Preparation,
                        Participants = participants,
                        Questions = questions,
                        Actions = actions
                    };
                    var evaluations = new List<Evaluation>(new Evaluation[] { evaluation });

                    context.Projects.Add(new Project
                    {
                        FusionProjectId = "1",
                        CreateDate = DateTime.UtcNow,
                        Evaluations = evaluations
                    });

                    context.SaveChangesAsync();
                }
            }
        }
    }
}
