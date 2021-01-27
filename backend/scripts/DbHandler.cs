using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

using Microsoft.EntityFrameworkCore;

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
            DbContextOptionsBuilder<BmtDbContext> builder = new DbContextOptionsBuilder<BmtDbContext>();
            builder.UseSqlServer(ConnectionString);
            BmtDbContext context = new BmtDbContext(builder.Options);

            List<QuestionTemplate> questions;
            using (StreamReader reader = new StreamReader(questionFile))
            {
                string json = reader.ReadToEnd();
                questions = JsonSerializer.Deserialize<List<QuestionTemplate>>(json, JsonUtils.SerializerOptions);
            }
            int order = 0;
            foreach (QuestionTemplate q in questions)
            {
                q.CreateDate = DateTimeOffset.UtcNow;
                q.Status = Status.Active;
                q.Order = order;
                order += 1;
            }

            context.QuestionTemplates.AddRange(questions);
            context.SaveChanges();

            Console.WriteLine($"Added {questions.Count} to questionTemplate table in DB");
        }
    }
}
