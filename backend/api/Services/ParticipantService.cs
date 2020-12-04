using System;
using System.Linq;

using api.Context;
using api.Models;

namespace api.Services
{
    public class ParticipantService
    {
        private readonly BmtDbContext _context;

        public ParticipantService(BmtDbContext context)
        {
            _context = context;
        }

        public Participant Create(string azureUniqueId, Evaluation evaluation, Organization organization, Role role)
        {
            DateTime createDate = DateTime.UtcNow;

            Participant newParticipant = new Participant
            {
                CreateDate = createDate,
                AzureUniqueId = azureUniqueId,
                Evaluation = evaluation,
                Organization = organization,
                Role = role
            };

            _context.Participants.Add(newParticipant);

            _context.SaveChanges();
            return newParticipant;
        }

        public Participant Remove(string participantId)
        {
            Participant participant = GetParticipant(participantId);
            _context.Participants.Remove(participant);
            _context.SaveChanges();
            return participant;
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

        public Participant GetParticipant(string azureUniqueId, Evaluation evaluation)
        {
            if (evaluation == null)
            {
                throw new ArgumentNullException(nameof(evaluation));
            }

            Participant participant = _context.Participants.FirstOrDefault(participant =>
                participant.AzureUniqueId.Equals(azureUniqueId)
                && participant.Evaluation.Equals(evaluation)
            );

            if (participant == null)
            {
                throw new NotFoundInDBException($"Participant not found: azure id: {azureUniqueId}, evaluation id: {evaluation.Id}");
            }

            return participant;
        }
    }
}
