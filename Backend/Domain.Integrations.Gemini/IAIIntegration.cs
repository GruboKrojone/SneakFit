using Domain.Integrations.Gemini.Dto;

namespace Domain.Integrations.Gemini;

public interface IAIIntegration
{
    public Task<GeminiResponse> GetAiResponse(GeminiRequest request);
}
