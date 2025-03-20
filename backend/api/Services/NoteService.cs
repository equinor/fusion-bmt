using api.Context;
using api.Models;
using Action = api.Models.Action;

namespace api.Services
{
    public class NoteService
    {
        private readonly BmtDbContext _context;

        public NoteService(BmtDbContext context)
        {
            _context = context;
        }

        public Note Create(
            Participant createdBy,
            string text,
            Action action
        )
        {
            DateTimeOffset createDate = DateTimeOffset.UtcNow;

            Note newNote = new Note
            {
                CreateDate = createDate,
                Text = text,
                CreatedBy = createdBy,
                Action = action
            };

            _context.Notes.Add(newNote);

            _context.SaveChanges();

            return newNote;
        }

        public Note EditNote(
            Note note,
            string text
        )
        {
            if (note == null)
            {
                throw new ArgumentNullException(nameof(note));
            }

            note.Text = text;

            _context.Notes.Update(note);
            _context.SaveChanges();

            return note;
        }

        public IQueryable<Note> GetAll()
        {
            return _context.Notes;
        }

        public Note GetNote(string noteId)
        {
            Note Note = _context.Notes.FirstOrDefault(note => note.Id.Equals(noteId));

            if (Note == null)
            {
                throw new NotFoundInDBException($"Note not found: {noteId}");
            }

            return Note;
        }
    }
}
