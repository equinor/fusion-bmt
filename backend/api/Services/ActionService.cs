using System;
using System.Linq;

using api.Context;
using api.Models;
using Action = api.Models.Action;

namespace api.Services
{
    public class ActionService
    {
        private readonly BmtDbContext _context;

        public ActionService(BmtDbContext context)
        {
            _context = context;
        }

        public Action Create(
            Participant assignedTo,
            Participant createdBy,
            string description,
            DateTimeOffset dueDate,
            string title,
            Priority priority,
            Question question
        )
        {
            DateTimeOffset createDate = DateTimeOffset.UtcNow;

            Action newAction = new Action
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

            _context.Actions.Add(newAction);

            _context.SaveChanges();
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

            _context.Actions.Update(action);
            _context.SaveChanges();

            return action;
        }

        public IQueryable<Action> GetAll()
        {
            return _context.Actions;
        }

        public IQueryable<Action> GetAction(string actionId)
        {
            IQueryable<Action> queryableAction = _context.Actions.Where(action => action.Id.Equals(actionId));
            Action action = queryableAction.FirstOrDefault();
            if (action == null)
            {
                throw new NotFoundInDBException($"Action not found: {actionId}");
            }
            return queryableAction;
        }
    }
}
