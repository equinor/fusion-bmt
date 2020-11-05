using System;
using System.Linq;

using HotChocolate;

using api.Context;
using api.Models;

namespace api.Services
{
    public class ParticipantService
    {
        private readonly BmtDbContext _context;

        public ParticipantService([Service] BmtDbContext context)
        {
            _context = context;
        }

        public Participant Create(string fusionPersonId, Evaluation evaluation, Organization organization, Role role)
        {
            DateTime createDate = DateTime.UtcNow;

            Participant newParticipant = new Participant
            {
                CreateDate = createDate,
                FusionPersonId = fusionPersonId,
                Evaluation = evaluation,
                Organization = organization,
                Role = role
            };

            _context.Participants.Add(newParticipant);

            _context.SaveChanges();
            return newParticipant;
        }

        public void Remove(string participantId)
        {
            _context.Participants.Remove(GetParticipant(participantId));
            _context.SaveChanges();
        }

        public IQueryable<Participant> GetAll()
        {
            return _context.Participants;
        }

        public Participant GetParticipant(string participantId)
        {
            Participant participant = _context.Participants.FirstOrDefault(participant => participant.Id.Equals(participantId));
            if (participant == null)
            {
                throw new NotFoundInDBException($"Participant not found: {participantId}");
            }
            return participant;
        }
    }
}
