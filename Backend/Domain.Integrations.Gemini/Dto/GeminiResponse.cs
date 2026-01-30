using System.Text.Json.Serialization;

namespace Domain.Integrations.Gemini.Dto;

public record GeminiResponse(
    [property: JsonPropertyName("candidates")] List<Candidate> Candidates
);

public record Candidate(
    [property: JsonPropertyName("content")] Content Content
);