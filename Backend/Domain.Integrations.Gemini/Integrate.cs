using System.Text;
using System.Text.Json;
using Core.Configuration.AI;
using Core.Middlewares;
using Domain.Integrations.Gemini.Dto;

namespace Domain.Integrations.Gemini;

internal class Integrate(HttpClient httpClient, IAiConfig aiConfig) : IAIIntegration
{
    public async Task<GeminiResponse> GetAiResponse(GeminiRequest request)
    {
        var jsonRequest = JsonSerializer.Serialize(request);
        var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

        var requestMessage = new HttpRequestMessage(HttpMethod.Post, aiConfig.BaseUrl)
        {
            Content = content
        };
        requestMessage.Headers.Add("x-goog-api-key", aiConfig.ApiKey);

        var response = await httpClient.SendAsync(requestMessage);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new DomainException(
                $"Gemini API request failed with status {response.StatusCode}: {errorContent}",
                (int)response.StatusCode);
        }

        var jsonResponse = await response.Content.ReadAsStringAsync();
        var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(jsonResponse);

        return geminiResponse
            ?? throw new DomainException("Failed to deserialize Gemini response.", 500);
    }
}