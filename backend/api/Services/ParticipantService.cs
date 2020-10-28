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

        public IQueryable<Participant> GetAll()
        {
            return _context.Participants;
        }

        public Participant GetParticipant(string participantId)
        {
            Participant participant = _context.Participants.FirstOrDefault(participant => participant.Id.Equals(participantId));
            if (participant == null)
            {
                throw new Exception($"Participant not found: {participantId}");
            }
            return participant;
        }
    }
}
