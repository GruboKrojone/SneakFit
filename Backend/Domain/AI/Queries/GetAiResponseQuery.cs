using System.Text.RegularExpressions;
using Core.CQRS;
using Domain.AI.Dto;
using Domain.Integrations.Gemini;
using Domain.Integrations.Gemini.Dto;

namespace Domain.AI.Queries;

public record GetAiResponseQuery(AiGeneratedDishProperties Props) : IQuery<string>;

internal class GetAiResponseQueryHandler(IAIIntegration integration) : IQueryHandler<GetAiResponseQuery, string>
{
    public async Task<string> Handle(GetAiResponseQuery request, CancellationToken cancellationToken)
    {
        var prequest = $"You are a professional chef. Return your response in {request.Props.Lang} language.\r\nGenerate a dish recipe (1 portion) based on these parameters:\r\n- Categories: {string.Join(", ", request.Props.Categories.Select(c => c.Name))}\r\n- Tastes: {string.Join(", ", request.Props.Tastes.Select(FormatEnumValue))}\r\n- Available tools: {string.Join(", ", request.Props.RequiredTools.Select(FormatEnumValue))} (optimize recipe for these tools)\r\n\r\nPlease use the following Markdown structure strictly:\r\n\r\n## Recipe Name\r\n\r\n**Categories:** [List of categories]\r\n**Required Tools:** [List of tools used]\r\n\r\n### Ingredients (1 portion):\r\n* [Quantity] [Unit] - [Ingredient Name]\r\n* ...\r\n\r\n### Preparation Steps:\r\n1. [Step 1]\r\n2. [Step 2]\r\n...\r\n\r\n### Estimates (per portion):\r\n* **Time:** [Minutes]\r\n* **Calories:** [kcal]\r\n* **Carbs:** [g]\r\n* **Proteins:** [g]\r\n* **Fat:** [g]";

        var geminiRequest = new GeminiRequest(
            Contents:
            [
                new(
                    Parts:
                    [
                        new(Text: prequest)
                    ]
                )
            ]
        );

        var response = await integration.GetAiResponse(geminiRequest);

        return response.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text
            ?? "No response received from AI";
    }

    private static string FormatEnumValue<T>(T value) where T : Enum =>
        Regex.Replace(value.ToString(), "([a-z])([A-Z])", "$1 $2");
}