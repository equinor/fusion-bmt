using api.Context;
using api.Models;
using Microsoft.EntityFrameworkCore;
using Barrier = api.Models.Barrier;

namespace api.Services;

public class QuestionTemplateService(BmtDbContext context)
{
    public List<QuestionTemplate> ActiveQuestions(ProjectCategory projectCategory)
    {
        var questions = context.QuestionTemplates
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
        return context.QuestionTemplates;
    }

    private int NumberOfQuestionsInBarrier(Barrier barrier)
    {
        return context.QuestionTemplates
                      .Where(qt => qt.Status == Status.Active)
                      .Where(qt => qt.Barrier == barrier)
                      .Count()
            ;
    }

    public QuestionTemplate Create(
        Barrier barrier,
        Organization organization,
        string text,
        string supportNotes,
        int newOrder = 0
    )
    {
        var createDate = DateTimeOffset.UtcNow;

        var last = context.QuestionTemplates
                          .Where(qt => qt.Status == Status.Active)
                          .Max(qt => qt.Order) + 1
            ;

        var maxAdminOrder = context.QuestionTemplates
                                   .Where(qt => qt.Status == Status.Active)
                                   .Max(qt => qt.AdminOrder) + 1
            ;

        // If newOrder == 0, we want to place the new
        // question template as the last one in the barrier.
        // If the current barrier is empty, the new order is
        // set to the maximum order + 1 of the previous barrier.
        // If also the previous barrier is empty, the new order is
        // set to the maximum order + 1 of the barrier before that
        // one and so on. If all barriers prior to the current
        // barrier is empty, the new order is set to 1.
        if (newOrder == 0)
        {
            var currentBarrier = barrier;

            while (NumberOfQuestionsInBarrier(currentBarrier) == 0 && currentBarrier != Barrier.GM)
            {
                var prevBarrier = currentBarrier - 1;
                currentBarrier = prevBarrier;
            }

            if (currentBarrier == Barrier.GM && NumberOfQuestionsInBarrier(currentBarrier) == 0)
            {
                newOrder = 1;
            }
            else
            {
                newOrder = context.QuestionTemplates
                                  .Where(qt => qt.Status == Status.Active)
                                  .Where(qt => qt.Barrier == currentBarrier)
                                  .Max(qt => qt.Order) + 1
                    ;
            }
        }

        var newQuestionTemplate = new QuestionTemplate
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

        context.QuestionTemplates.Add(newQuestionTemplate);
        context.SaveChanges();

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

        var newQuestionTemplate = new QuestionTemplate
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

        context.QuestionTemplates.Add(newQuestionTemplate);

        questionTemplate.Status = Status.Inactive;
        context.QuestionTemplates.Update(questionTemplate);
        context.SaveChanges();

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
        context.QuestionTemplates.Update(questionTemplate);
        context.SaveChanges();

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
        var template = context.QuestionTemplates
                              .Include(x => x.ProjectCategories)
                              .Single(x => x.Id == questionTemplateId)
            ;

        var projectCategory = context.ProjectCategories
                                     .Single(x => x.Id == projectCategoryId)
            ;

        if (template.ProjectCategories.Contains(projectCategory))
        {
            var msg = "QuestionTemplate is already in ProjectCategory";

            throw new Exception(msg);
        }

        template.ProjectCategories.Add(projectCategory);
        context.SaveChanges();

        return template;
    }

    public QuestionTemplate RemoveFromProjectCategories(
        string questionTemplateId,
        List<string> projectCategoryIds
    )
    {
        var template = context.QuestionTemplates
                              .Include(x => x.ProjectCategories)
                              .Single(x => x.Id == questionTemplateId)
            ;

        foreach (var id in projectCategoryIds)
        {
            var projectCategory = context.ProjectCategories
                                         .Single(x => x.Id == id)
                ;

            if (!template.ProjectCategories.Contains(projectCategory))
            {
                var msg = "QuestionTemplate is not in ProjectCategory";

                throw new Exception(msg);
            }

            template.ProjectCategories.Remove(projectCategory);
        }

        context.SaveChanges();

        return template;
    }

    private QuestionTemplate ReorderQuestionTemplateInternal(QuestionTemplate questionTemplate, int newOrder)
    {
        // Reordering is not necessary for question templates that are not Active
        if (questionTemplate.Status != Status.Active)
        {
            return questionTemplate;
        }

        questionTemplate.Order = newOrder;
        context.QuestionTemplates.Update(questionTemplate);

        var questionTemplates = context.QuestionTemplates
                                       .Where(qt => qt.Status == Status.Active)
                                       .Where(qt => qt.Id != questionTemplate.Id)
                                       .OrderBy(qt => qt.Order)
            ;

        var order = 1;

        foreach (var qt in questionTemplates)
        {
            if (order == newOrder)
            {
                // Skip new order to make room for updated QT
                order += 1;
            }

            qt.Order = order++;
            context.QuestionTemplates.Update(qt);
        }

        context.SaveChanges();

        return questionTemplate;
    }

    public QuestionTemplate ReorderQuestionTemplate(QuestionTemplate questionTemplate)
    {
        var newOrder = context.QuestionTemplates.Where(qt => qt.Status == Status.Active).Max(qt => qt.Order);

        return ReorderQuestionTemplateInternal(questionTemplate, newOrder);
    }

    public QuestionTemplate ReorderQuestionTemplate(QuestionTemplate questionTemplate, QuestionTemplate newNextQuestionTemplate)
    {
        var newOrder = newNextQuestionTemplate.Order - 1;

        return ReorderQuestionTemplateInternal(questionTemplate, newOrder);
    }

    public QuestionTemplate GetQuestionTemplate(string questionTemplateId)
    {
        var questionTemplate = context.QuestionTemplates.FirstOrDefault(qt => qt.Id.Equals(questionTemplateId));

        if (questionTemplate == null)
        {
            throw new NotFoundInDBException($"QuestionTemplate not found: {questionTemplateId}");
        }

        return questionTemplate;
    }
}