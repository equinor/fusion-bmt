using api.Context;
using api.Models;

namespace api.Services;

public class ParticipantService(BmtDbContext context)
{
    public Participant Create(string azureUniqueId, Evaluation evaluation, Organization organization, Role role)
    {
        var createDate = DateTimeOffset.UtcNow;

        var newParticipant = new Participant
        {
            CreateDate = createDate,
            AzureUniqueId = azureUniqueId,
            Evaluation = evaluation,
            Organization = organization,
            Role = role,
            Progression = evaluation.Progression
        };

        context.Participants.Add(newParticipant);

        context.SaveChanges();

        return newParticipant;
    }

    public Participant Remove(string participantId)
    {
        var participant = GetParticipant(participantId);
        context.Participants.Remove(participant);
        context.SaveChanges();

        return participant;
    }

    public IQueryable<Participant> GetAll()
    {
        return context.Participants;
    }

    public Participant GetParticipant(string participantId)
    {
        var participant = context.Participants.FirstOrDefault(participant => participant.Id.Equals(participantId));

        if (participant == null)
        {
            throw new NotFoundInDBException($"Participant not found: {participantId}");
        }

        return participant;
    }

    public Participant GetParticipant(string azureUniqueId, Evaluation evaluation, bool isAdmin = false)
    {
        if (evaluation == null)
        {
            throw new ArgumentNullException(nameof(evaluation));
        }

        var participant = context
                          .Participants
                          .FirstOrDefault(participant =>
                                              participant.AzureUniqueId.Equals(azureUniqueId)
                                              && participant.Evaluation.Equals(evaluation)
                          );

        if (participant == null && !isAdmin)
        {
            throw new NotFoundInDBException($"Participant not found: azure id: {azureUniqueId}, evaluation id: {evaluation.Id}");
        }

        return participant;
    }

    public IQueryable<Participant> ProgressAllParticipants(Evaluation evaluation, Progression newProgression)
    {
        var participants = context.Participants.Where(p => p.Evaluation.Equals(evaluation));

        foreach (var p in participants)
        {
            p.Progression = newProgression;
        }

        context.UpdateRange(participants);
        context.SaveChanges();

        return participants;
    }

    public Participant ProgressParticipant(Participant participant, Progression newProgression)
    {
        participant.Progression = newProgression;

        context.Update(participant);
        context.SaveChanges();

        return participant;
    }
}
