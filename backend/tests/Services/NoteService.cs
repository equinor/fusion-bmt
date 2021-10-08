using System;
using System.Linq;

using Xunit;

using api.Models;
using Action = api.Models.Action;
using api.Services;

namespace tests
{
    [Collection("Database collection")]
    public class NoteServiceTest
    {
        DatabaseFixture fixture;

        public NoteServiceTest(DatabaseFixture fixture)
        {
            this.fixture = fixture;
        }
        [Fact]
        public void GetQueryable()
        {
            NoteService noteService = new NoteService(fixture.context);

            IQueryable<Note> noteQueryable = noteService.GetAll();

            Assert.True(noteQueryable.Count() > 0);
        }

        [Fact]
        public void Create()
        {
            ParticipantService participantService = new ParticipantService(fixture.context);
            Participant participant = participantService.GetAll().First();
            ActionService actionService = new ActionService(fixture.context);
            Action action = actionService.GetAll().First();

            NoteService noteService = new NoteService(fixture.context);
            int nNoteBefore = noteService.GetAll().Count();
            noteService.Create(participant, "text", action);
            int nNotesAfter = noteService.GetAll().Count();

            Assert.Equal(nNoteBefore + 1, nNotesAfter);
        }

        [Fact]
        public void GetDoesNotExist()
        {
            NoteService noteService = new NoteService(fixture.context);

            Assert.Throws<NotFoundInDBException>(() => noteService.GetNote("some_note_id_that_does_not_exist"));
        }

        [Fact]
        public void GetExists()
        {
            NoteService noteService = new NoteService(fixture.context);
            ParticipantService participantService = new ParticipantService(fixture.context);
            Participant participant = participantService.GetAll().First();
            ActionService actionService = new ActionService(fixture.context);
            Action action = actionService.GetAll().First();

            Note NoteCreate = noteService.Create(participant, "text", action);

            Note NoteGet = noteService.GetNote(NoteCreate.Id);

            Assert.Equal(NoteCreate, NoteGet);
        }

        [Fact]
        public void EditNote()
        {
            ParticipantService participantService = new ParticipantService(fixture.context);
            Participant participant = participantService.GetAll().First();

            ActionService actionService = new ActionService(fixture.context);
            Action action = actionService.GetAll().First();

            NoteService noteService = new NoteService(fixture.context);
            string initialText = "initial text";
            Note note = noteService.Create(participant, initialText, action);
            string noteId = note.Id;

            string newText = "new text";
            noteService.EditNote(note, newText);

            Note resultingNote = noteService.GetNote(noteId);
            Assert.Equal(newText, resultingNote.Text);
        }
    }
}
