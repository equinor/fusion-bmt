using api.Context;
using api.Models;
using Action = api.Models.Action;

namespace api.Services;

public class ActionService(BmtDbContext context)
{
    public Action Create(
        Participant createdBy,
        Participant assignedTo,
        string description,
        DateTimeOffset dueDate,
        string title,
        Priority priority,
        Question question
    )
    {
        var createDate = DateTimeOffset.UtcNow;

        var newAction = new Action
        {
            CreateDate = createDate,
            AssignedTo = assignedTo,
            CreatedBy = createdBy,
            Description = description,
            DueDate = dueDate,
            OnHold = false,
            Completed = false,
            Priority = priority,
            Title = title,
            Question = question
        };

        context.Actions.Add(newAction);

        context.SaveChanges();

        return newAction;
    }

    public Action EditAction(
        Action action,
        Participant assignedTo,
        string description,
        DateTimeOffset dueDate,
        string title,
        bool onHold,
        bool completed,
        Priority priority
    )
    {
        if (action == null)
        {
            throw new ArgumentNullException(nameof(action));
        }

        action.AssignedTo = assignedTo;
        action.Description = description;
        action.DueDate = dueDate;
        action.Title = title;
        action.OnHold = onHold;
        action.Completed = completed;
        action.Priority = priority;

        context.Actions.Update(action);
        context.SaveChanges();

        return action;
    }

    public Action SetVoid(Action action, bool newStatus)
    {
        action.IsVoided = newStatus;
        context.Actions.Update(action);
        context.SaveChanges();

        return action;
    }

    public IQueryable<Action> GetAll()
    {
        return context.Actions;
    }

    public IQueryable<Action> GetAction(string actionId)
    {
        var queryableAction = context.Actions.Where(action => action.Id.Equals(actionId));
        var action = queryableAction.FirstOrDefault();

        if (action == null)
        {
            throw new NotFoundInDBException($"Action not found: {actionId}");
        }

        return queryableAction;
    }
}