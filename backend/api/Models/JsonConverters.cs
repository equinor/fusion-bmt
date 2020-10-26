using System;
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
            ){
                string barrierString = reader.GetString();
                Barrier barrier;
                switch(barrierString)
                {
                    case "General matters":
                        barrier = Barrier.GM;
                        break;
                    case "PS1 Containment":
                        barrier = Barrier.PS1;
                        break;
                    case "PS2 HVAC":
                        barrier = Barrier.PS2;
                        break;
                    case "PS3 Leak Detection":
                        barrier = Barrier.PS3;
                        break;
                    case "PS4 ESD":
                        barrier = Barrier.PS4;
                        break;
                    case "PS6 Ignition Source Control":
                        barrier = Barrier.PS6;
                        break;
                    case "PS7 Fire detection":
                        barrier = Barrier.PS7;
                        break;
                    case "PS12 Process Safety":
                        barrier = Barrier.PS12;
                        break;
                    case "PS15 Layout":
                        barrier = Barrier.PS15;
                        break;
                    case "PS22 HMI":
                        barrier = Barrier.PS22;
                        break;
                    default:
                        throw new Exception($"Barrier from JSON is not valid: '{barrierString}'");
                }
                return barrier;
            }


        public override void Write(
            Utf8JsonWriter writer,
            Barrier barrier,
            JsonSerializerOptions options
            ){
                writer.WriteStringValue(barrier.ToString());
            }
        }

        public class OrganizationConverter : JsonConverter<Organization>
        {
            public override Organization Read(
                ref Utf8JsonReader reader,
                Type typeToConvert,
                JsonSerializerOptions options
            ){
                string organizationString = reader.GetString();
                Organization organization;
                switch(organizationString)
                {
                    case "All":
                        organization = Organization.All;
                        break;
                    case "Engineering":
                        organization = Organization.Engineering;
                        break;
                    case "Construction":
                        organization = Organization.Construction;
                        break;
                    case "Preparing for operation":
                        organization = Organization.PreOps;
                        break;
                    case "Commissioning":
                        organization = Organization.Commissioning;
                        break;
                    default:
                        throw new Exception($"Organization from JSON is not valid: '{organizationString}'");
                }
                return organization;
            }


        public override void Write(
            Utf8JsonWriter writer,
            Organization organization,
            JsonSerializerOptions options
            ){
                writer.WriteStringValue(organization.ToString());
            }
        }
}
