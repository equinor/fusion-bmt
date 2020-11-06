using System;
using System.Linq;
using System.Collections.Generic;

using HotChocolate;

using api.Context;
using api.Models;

namespace api.Services
{
    public class QuestionTemplateService
    {
        private readonly BmtDbContext _context;

        public QuestionTemplateService([Service] BmtDbContext context)
        {
            _context = context;
        }

        public List<QuestionTemplate> ActiveQuestions()
        {
            List<QuestionTemplate> questions = _context.QuestionTemplates.Where(
                template => template.Status.Equals(Status.Active)
            ).ToList();
            return questions;
        }

        public IQueryable<QuestionTemplate> GetAll()
        {
            return _context.QuestionTemplates;
        }

        private QuestionTemplate Create(
            Barrier barrier,
            Organization organization,
            Status status,
            string text,
            string supportNotes
        )
        {
            DateTime createDate = DateTime.UtcNow;

            QuestionTemplate newQuestionTemplate = new QuestionTemplate
            {
                CreateDate = createDate,
                Barrier = barrier,
                Organization = organization,
                Status = status,
                Text = text,
                SupportNotes = supportNotes
            };

            _context.QuestionTemplates.Add(newQuestionTemplate);

            _context.SaveChanges();
            return newQuestionTemplate;
        }
    }
}
