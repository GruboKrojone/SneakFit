using System.Text.Json.Serialization;

namespace Domain.Integrations.Gemini.Dto;

public record GeminiRequest(
    [property: JsonPropertyName("contents")] List<Content> Contents
);

public record Content(
    [property: JsonPropertyName("parts")] List<Part> Parts
);

public record Part(
    [property: JsonPropertyName("text")] string Text
);