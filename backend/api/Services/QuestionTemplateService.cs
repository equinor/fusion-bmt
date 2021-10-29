using System;
using System.Linq;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

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

        public List<QuestionTemplate> ActiveQuestions(ProjectCategory projectCategory)
        {
            List<QuestionTemplate> questions = _context.QuestionTemplates
                .Include(x => x.ProjectCategories)
                .Where(template =>
                    template.Status.Equals(Status.Active) &&
                    template.ProjectCategories.Contains(projectCategory)
                )
                .ToList();

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
            string supportNotes,
            int newOrder = 0
        )
        {
            DateTimeOffset createDate = DateTimeOffset.UtcNow;
            int last = _context.QuestionTemplates
                .Where(qt => qt.Status == Status.Active)
                .Max(qt => qt.Order) + 1
            ;
            int maxAdminOrder = _context.QuestionTemplates
                .Where(qt => qt.Status == Status.Active)
                .Max(qt => qt.AdminOrder) + 1
            ;

            // If newOrder == 0, we want to place the new
            // question template as the last one in the barrier
            if (newOrder == 0)
            {
                newOrder = _context.QuestionTemplates
                    .Where(qt => qt.Status == Status.Active)
                    .Where(qt => qt.Barrier == barrier)
                    .Max(qt => qt.Order) + 1
                ;
            }

            QuestionTemplate newQuestionTemplate = new QuestionTemplate
            {
                CreateDate = createDate,
                Barrier = barrier,
                Organization = organization,
                Status = Status.Active,
                Text = text,
                Order = last,
                SupportNotes = supportNotes,
                AdminOrder = maxAdminOrder
            };

            _context.QuestionTemplates.Add(newQuestionTemplate);
            _context.SaveChanges();

            return ReorderQuestionTemplateInternal(newQuestionTemplate, newOrder);
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
                previous = questionTemplate,
                ProjectCategories = questionTemplate.ProjectCategories,
                AdminOrder = questionTemplate.AdminOrder
            };
            _context.QuestionTemplates.Add(newQuestionTemplate);

            questionTemplate.Status = Status.Inactive;
            _context.QuestionTemplates.Update(questionTemplate);
            _context.SaveChanges();
            return newQuestionTemplate;
        }

        public QuestionTemplate Delete(QuestionTemplate questionTemplate)
        {
            /* ReorderQuestionTemplate gives the question template
            *  that should be deleted the highest order, and gives the
            *  remaining question templates the correct order. The
            *  consquence is that all active question templates are
            *  ordered correctly.
            */
            ReorderQuestionTemplate(questionTemplate);
            questionTemplate.Status = Status.Voided;
            _context.QuestionTemplates.Update(questionTemplate);
            _context.SaveChanges();
            return questionTemplate;
        }

        public QuestionTemplate AddToProjectCategory(
            string questionTemplateId,
            string projectCategoryId
        )
        {
            /* The Include solves 2 problems for us:
             *
             *  1) Include, as the name suggest, includes the navigation
             *  property ProjectCategory in the query. Which is the property that we
             *  want to alter.
             *
             *  2) Because we don't explicitly initialize the navigation
             *  property "ProjectCategories", it will be null after creation.
             *  This will obviously make the rest of the code fail. Explicitly
             *  querying ProjectCategories will initialize it when applicable.
             *
             *  Because Include increases the query size, it introduces a
             *  performance hit. In this case there is no way around it as we
             *  need to query for both QuestionTemplate and it's
             *  ProjectCategories.  Luckily ProjectCategories.Count() will
             *  always be reasonable small.
             *
             *  Because of the performance implications of Include, the
             *  signature of this method breaks the general convention of the
             *  class by taking in Ids rather than Objects. This design was
             *  chosen to relieve the caller from having to make the correct
             *  object Query. E.g. if the caller got the QuestionTemplate
             *  object from GetQuestionTemplate() and passed that to this
             *  method, it would fail as GetQuestionTemplate() doesn't (and
             *  shouldn't) do Include.
             */
            var template = _context.QuestionTemplates
                .Include(x => x.ProjectCategories)
                .Single(x => x.Id == questionTemplateId)
            ;

            var projectCategory = _context.ProjectCategories
                .Single(x => x.Id == projectCategoryId)
            ;

            if (template.ProjectCategories.Contains(projectCategory))
            {
                string msg = "QuestionTemplate is already in ProjectCategory";
                throw new Exception(msg);
            }

            template.ProjectCategories.Add(projectCategory);
            _context.SaveChanges();
            return template;
        }

        public QuestionTemplate RemoveFromProjectCategories(
            string questionTemplateId,
            List<string> projectCategoryIds
        )
        {
            var template = _context.QuestionTemplates
                .Include(x => x.ProjectCategories)
                .Single(x => x.Id == questionTemplateId)
            ;

            foreach (var id in projectCategoryIds)
            {
                var projectCategory = _context.ProjectCategories
                    .Single(x => x.Id == id)
                ;

                if (!template.ProjectCategories.Contains(projectCategory))
                {
                    string msg = "QuestionTemplate is not in ProjectCategory";
                    throw new Exception(msg);
                }

                template.ProjectCategories.Remove(projectCategory);
            }

            _context.SaveChanges();
            return template;
        }

        private QuestionTemplate ReorderQuestionTemplateInternal(QuestionTemplate questionTemplate, int newOrder)
        {
            // Reordering is not necessary for question templates that are not Active
            if (questionTemplate.Status != Status.Active) {
                return questionTemplate;
            }

            questionTemplate.Order = newOrder;
            _context.QuestionTemplates.Update(questionTemplate);

            var questionTemplates = _context.QuestionTemplates
                .Where(qt => qt.Status == Status.Active)
                .Where(qt => qt.Id != questionTemplate.Id)
                .OrderBy(qt => qt.Order)
            ;

            int order = 1;
            foreach (QuestionTemplate qt in questionTemplates)
            {
                if (order == newOrder)
                {
                    // Skip new order to make room for updated QT
                    order += 1;
                }
                qt.Order = order++;
                _context.QuestionTemplates.Update(qt);
            }

            _context.SaveChanges();
            return questionTemplate;
        }

        public QuestionTemplate ReorderQuestionTemplate(QuestionTemplate questionTemplate)
        {
            int newOrder = _context.QuestionTemplates.Where(qt => qt.Status == Status.Active).Max(qt => qt.Order);
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
