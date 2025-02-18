using api.Context;
using api.Models;
using Action = api.Models.Action;

namespace api.Services
{
    public class ClosingRemarkService
    {
        private readonly BmtDbContext _context;

        public ClosingRemarkService(BmtDbContext context)
        {
            _context = context;
        }

        public ClosingRemark Create(
            Participant createdBy,
            string text,
            Action action
        )
        {
            DateTimeOffset createDate = DateTimeOffset.UtcNow;

            ClosingRemark newClosingRemark = new ClosingRemark
            {
                CreateDate = createDate,
                Text = text,
                CreatedBy = createdBy,
                Action = action
            };

            _context.ClosingRemarks.Add(newClosingRemark);

            _context.SaveChanges();
            return newClosingRemark;
        }

        public IQueryable<ClosingRemark> GetAll()
        {
            return _context.ClosingRemarks;
        }

        public ClosingRemark GetClosingRemark(string closingRemarkId)
        {
            ClosingRemark ClosingRemark = _context.ClosingRemarks.FirstOrDefault(closingRemark => closingRemark.Id.Equals(closingRemarkId));
            if (ClosingRemark == null)
            {
                throw new NotFoundInDBException($"ClosingRemark not found: {closingRemarkId}");
            }
            return ClosingRemark;
        }
    }
}
