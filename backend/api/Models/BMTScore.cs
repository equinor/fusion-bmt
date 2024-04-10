namespace api.Models
{
    public class BMTScore
    {
        public string ProjectId { get; set; }
        public string EvaluationId { get; set; }
        public double FollowUpScore { get; set; }
        public double WorkshopScore { get; set; }
    }
}
