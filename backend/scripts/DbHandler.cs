using System;
using System.Collections.Generic;
using System.Linq;
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
            int order = 1;
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

        public void OrderQuestionsInEvaluation(string evaluationId)
        {
            string ConnectionString = Environment.GetEnvironmentVariable("Database__ConnectionString");
            if (string.IsNullOrEmpty(ConnectionString))
            {
                throw new ArgumentException("ConnectionString cannot be empty");
            }
            DbContextOptionsBuilder<BmtDbContext> builder = new DbContextOptionsBuilder<BmtDbContext>();
            builder.UseSqlServer(ConnectionString);
            BmtDbContext context = new BmtDbContext(builder.Options);

            List<Question> questions = context.Questions.Include(q => q.QuestionTemplate).Where(q => q.Evaluation.Id.Equals(evaluationId)).ToList();
            foreach (Question q in questions)
            {
                q.Order = q.QuestionTemplate.Order;
            }
            context.Questions.UpdateRange(questions);
            context.SaveChanges();
        }

        public void OrderQuestionTemplates(string questionFile)
        {
            string ConnectionString = Environment.GetEnvironmentVariable("Database__ConnectionString");
            if (string.IsNullOrEmpty(ConnectionString))
            {
                throw new ArgumentException("ConnectionString cannot be empty");
            }
            DbContextOptionsBuilder<BmtDbContext> builder = new DbContextOptionsBuilder<BmtDbContext>();
            builder.UseSqlServer(ConnectionString);
            BmtDbContext context = new BmtDbContext(builder.Options);

            List<QuestionTemplate> questionsFromFile;
            using (StreamReader reader = new StreamReader(questionFile))
            {
                string json = reader.ReadToEnd();
                questionsFromFile = JsonSerializer.Deserialize<List<QuestionTemplate>>(json, JsonUtils.SerializerOptions);
            }

            List<QuestionTemplate> questions = context.QuestionTemplates.ToList();
            Console.WriteLine($"Ordering {questions.Count} questions");
            foreach (QuestionTemplate questionTemplate in questions)
            {
                QuestionTemplate qtFromFile = questionsFromFile.First(qt => qt.Text.Equals(questionTemplate.Text));
                questionTemplate.Order = qtFromFile.Order + 1;
            }

            List<int> ints = questions.Select(qt => qt.Order).ToList();
            HashSet<int> intSet = new HashSet<int>(ints);
            Console.WriteLine($"Distinct orders after: {intSet.Count}");
            context.QuestionTemplates.UpdateRange(questions);
            context.SaveChanges();
        }
    }
}
