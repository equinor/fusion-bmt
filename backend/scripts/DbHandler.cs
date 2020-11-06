using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

using Microsoft.Extensions.Options;

using api.Context;
using api.Models;
using api.Utils;

namespace scripts
{
    class DbHandler
    {
        public void PopulateQuestionTemplate(string questionFile)
        {
            string ConnectionString = Environment.GetEnvironmentVariable("Database__ConnectionString");
            if (string.IsNullOrEmpty(ConnectionString))
            {
                throw new ArgumentException("ConnectionString cannot be empty");
            }
            BmtDbOptions options = new BmtDbOptions { ConnectionString = ConnectionString };
            BmtDbContext context = new BmtDbContext(Options.Create(options));

            List<QuestionTemplate> questions;
            using (StreamReader reader = new StreamReader(questionFile))
            {
                string json = reader.ReadToEnd();
                questions = JsonSerializer.Deserialize<List<QuestionTemplate>>(json, JsonUtils.SerializerOptions);
            }
            foreach (QuestionTemplate q in questions)
            {
                q.CreateDate = DateTime.UtcNow;
                q.Status = Status.Active;
            }

            context.QuestionTemplates.AddRange(questions);
            context.SaveChanges();

            Console.WriteLine($"Added {questions.Count} to questionTemplate table in DB");
        }
    }
}
