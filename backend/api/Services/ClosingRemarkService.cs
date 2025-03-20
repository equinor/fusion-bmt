using api.Context;
using api.Models;
using Action = api.Models.Action;

namespace api.Services;

public class ClosingRemarkService(BmtDbContext context)
{
    public ClosingRemark Create(
        Participant createdBy,
        string text,
        Action action
    )
    {
        var createDate = DateTimeOffset.UtcNow;

        var newClosingRemark = new ClosingRemark
        {
            CreateDate = createDate,
            Text = text,
            CreatedBy = createdBy,
            Action = action
        };

        context.ClosingRemarks.Add(newClosingRemark);

        context.SaveChanges();

        return newClosingRemark;
    }

    public IQueryable<ClosingRemark> GetAll()
    {
        return context.ClosingRemarks;
    }

    public ClosingRemark GetClosingRemark(string closingRemarkId)
    {
        var ClosingRemark = context.ClosingRemarks.FirstOrDefault(closingRemark => closingRemark.Id.Equals(closingRemarkId));

        if (ClosingRemark == null)
        {
            throw new NotFoundInDBException($"ClosingRemark not found: {closingRemarkId}");
        }

        return ClosingRemark;
    }
}