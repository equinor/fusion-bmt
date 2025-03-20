using api.Context;
using api.Models;
using Action = api.Models.Action;

namespace api.Services;

public class NoteService(BmtDbContext context)
{
    public Note Create(
        Participant createdBy,
        string text,
        Action action
    )
    {
        var createDate = DateTimeOffset.UtcNow;

        var newNote = new Note
        {
            CreateDate = createDate,
            Text = text,
            CreatedBy = createdBy,
            Action = action
        };

        context.Notes.Add(newNote);

        context.SaveChanges();

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

        context.Notes.Update(note);
        context.SaveChanges();

        return note;
    }

    public IQueryable<Note> GetAll()
    {
        return context.Notes;
    }

    public Note GetNote(string noteId)
    {
        var Note = context.Notes.FirstOrDefault(note => note.Id.Equals(noteId));

        if (Note == null)
        {
            throw new NotFoundInDBException($"Note not found: {noteId}");
        }

        return Note;
    }
}