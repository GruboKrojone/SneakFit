using Core.CQRS;
using Domain.Integrations.Gemini;
using Domain.Integrations.Gemini.Dto;

namespace Domain.AI.Queries;

public record GetAiResponseQuery(string Message) : IQuery<string>;

internal class GetAiResponseQueryHandler(IAIIntegration integration) : IQueryHandler<GetAiResponseQuery, string>
{
    public async Task<string> Handle(GetAiResponseQuery request, CancellationToken cancellationToken)
    {
        var geminiRequest = new GeminiRequest(
            Contents:
            [
                new(
                    Parts:
                    [
                        new(Text: request.Message)
                    ]
                )
            ]
        );

        var response = await integration.GetAiResponse(geminiRequest);

        return response.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text
            ?? "No response received from AI";
    }
}