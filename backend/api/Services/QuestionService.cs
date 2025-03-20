using api.Context;
using api.Models;

namespace api.Services;

public class QuestionService(BmtDbContext context)
{
    public Question Create(
        QuestionTemplate template,
        Evaluation evaluation
    )
    {
        var newQuestion = CreateInternal(template, evaluation);
        context.Questions.Add(newQuestion);

        context.SaveChanges();

        return newQuestion;
    }

    private static Question CreateInternal(
        QuestionTemplate template,
        Evaluation evaluation
    )
    {
        var createDate = DateTimeOffset.UtcNow;

        return new Question
        {
            CreateDate = createDate,
            Barrier = template.Barrier,
            Evaluation = evaluation,
            Organization = template.Organization,
            Text = template.Text,
            Order = template.Order,
            SupportNotes = template.SupportNotes,
            QuestionTemplate = template,
        };
    }

    public List<Question> CreateBulk(
        List<QuestionTemplate> templates,
        Evaluation evaluation
    )
    {
        var questions = new List<Question>();

        foreach (var template in templates)
        {
            questions.Add(CreateInternal(template, evaluation));
        }

        context.Questions.AddRange(questions);
        context.SaveChanges();

        return questions;
    }

    public ICollection<Question> SquashOrder(ICollection<Question> questions)
    {
        var orderedQuestions = questions.OrderBy(q => q.Order);
        var order = 1;

        foreach (var q in orderedQuestions)
        {
            q.Order = order++;
            context.Questions.Update(q);
        }

        context.SaveChanges();

        return questions;
    }

    public IQueryable<Question> GetAll()
    {
        return context.Questions;
    }

    public IQueryable<Question> GetQuestion(string questionId)
    {
        var queryableQuestion = context.Questions.Where(question => question.Id.Equals(questionId));
        var question = queryableQuestion.FirstOrDefault();

        if (question == null)
        {
            throw new NotFoundInDBException($"Question not found: {questionId}");
        }

        return queryableQuestion;
    }
}