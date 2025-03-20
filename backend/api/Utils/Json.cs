using System.Text.Json;
using api.Models;

namespace api.Utils;

public static class JsonUtils
{
    public static readonly JsonSerializerOptions SerializerOptions = GetSerializeOptions();

    private static JsonSerializerOptions GetSerializeOptions()
    {
        var serializeOptions = new JsonSerializerOptions();
        serializeOptions.Converters.Add(new BarrierConverter());
        serializeOptions.Converters.Add(new OrganizationConverter());
        serializeOptions.WriteIndented = true;

        return serializeOptions;
    }
}