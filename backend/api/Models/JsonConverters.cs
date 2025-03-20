using System.Text.Json;
using System.Text.Json.Serialization;

namespace api.Models
{
    public class BarrierConverter : JsonConverter<Barrier>
    {
        public override Barrier Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            string barrierString = reader.GetString();

            Barrier barrier = barrierString switch
            {
                "General matters" => Barrier.GM,
                "PS1 Containment" => Barrier.PS1,
                "PS2 HVAC" => Barrier.PS2,
                "PS3 Leak Detection" => Barrier.PS3,
                "PS4 ESD" => Barrier.PS4,
                "PS6 Ignition Source Control" => Barrier.PS6,
                "PS7 Fire detection" => Barrier.PS7,
                "PS12 Process Safety" => Barrier.PS12,
                "PS15 Layout" => Barrier.PS15,
                "PS22 HMI" => Barrier.PS22,
                _ => throw new Exception($"Barrier from JSON is not valid: '{barrierString}'"),
            };

            return barrier;
        }

        public override void Write(
            Utf8JsonWriter writer,
            Barrier barrier,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(barrier.ToString());
        }
    }

    public class OrganizationConverter : JsonConverter<Organization>
    {
        public override Organization Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            string organizationString = reader.GetString();

            Organization organization = organizationString switch
            {
                "All" => Organization.All,
                "Engineering" => Organization.Engineering,
                "Construction" => Organization.Construction,
                "Preparing for operation" => Organization.PreOps,
                "Commissioning" => Organization.Commissioning,
                _ => throw new Exception($"Organization from JSON is not valid: '{organizationString}'"),
            };

            return organization;
        }

        public override void Write(
            Utf8JsonWriter writer,
            Organization organization,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(organization.ToString());
        }
    }
}
