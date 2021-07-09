using System;
using System.Linq;
using System.Collections.Generic;

using api.Context;
using api.Models;

namespace api.Services
{
    public class QuestionTemplateService
    {
        private readonly BmtDbContext _context;

        public QuestionTemplateService(BmtDbContext context)
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

        public QuestionTemplate Create(
            Barrier barrier,
            Organization organization,
            string text,
            string supportNotes
        )
        {
            DateTimeOffset createDate = DateTimeOffset.UtcNow;
            int last = _context.QuestionTemplates.Max(qt => qt.Order) + 1;

            QuestionTemplate newQuestionTemplate = new QuestionTemplate
            {
                CreateDate = createDate,
                Barrier = barrier,
                Organization = organization,
                Status = Status.Active,
                Text = text,
                Order = last,
                SupportNotes = supportNotes
            };

            _context.QuestionTemplates.Add(newQuestionTemplate);

            _context.SaveChanges();
            return newQuestionTemplate;
        }

        public QuestionTemplate Edit(
            QuestionTemplate questionTemplate,
            Barrier barrier,
            Organization organization,
            string text,
            string supportNotes,
            Status status
        )
        {
            if (questionTemplate == null)
            {
                throw new ArgumentNullException(nameof(questionTemplate));
            }
            QuestionTemplate newQuestionTemplate = new QuestionTemplate
            {
                Barrier = barrier,
                Organization = organization,
                Text = text,
                SupportNotes = supportNotes,
                Status = status,
                Order = questionTemplate.Order,
                previousId = questionTemplate,
            };
            _context.QuestionTemplates.Add(newQuestionTemplate);

            questionTemplate.Status = Status.Inactive;
            _context.QuestionTemplates.Update(questionTemplate);
            _context.SaveChanges();
            return newQuestionTemplate;
        }

        private QuestionTemplate ReorderQuestionTemplateInternal(QuestionTemplate questionTemplate, int newOrder)
        {
            List<QuestionTemplate> questionTemplates = _context.QuestionTemplates.OrderBy(qt => qt.Order).ToList();

            questionTemplates.Remove(questionTemplate);
            questionTemplates.Insert(newOrder - 1, questionTemplate);

            int order = 1;
            foreach (QuestionTemplate qt in questionTemplates)
            {
                qt.Order = order;
                order += 1;
            }

            _context.QuestionTemplates.UpdateRange(questionTemplates);
            _context.SaveChanges();
            return questionTemplate;
        }

        public QuestionTemplate ReorderQuestionTemplate(QuestionTemplate questionTemplate)
        {
            int newOrder = _context.QuestionTemplates.Max(qt => qt.Order);
            return ReorderQuestionTemplateInternal(questionTemplate, newOrder);
        }

        public QuestionTemplate ReorderQuestionTemplate(QuestionTemplate questionTemplate, QuestionTemplate newNextQuestionTemplate)
        {
            int newOrder = newNextQuestionTemplate.Order - 1;
            return ReorderQuestionTemplateInternal(questionTemplate, newOrder);
        }

        public QuestionTemplate GetQuestionTemplate(string questionTemplateId)
        {
            QuestionTemplate questionTemplate = _context.QuestionTemplates.FirstOrDefault(qt => qt.Id.Equals(questionTemplateId));
            if (questionTemplate == null)
            {
                throw new NotFoundInDBException($"QuestionTemplate not found: {questionTemplateId}");
            }
            return questionTemplate;
        }
    }
}
