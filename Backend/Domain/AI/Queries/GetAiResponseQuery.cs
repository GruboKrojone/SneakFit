using System.Linq;
using System.Text.RegularExpressions;
using Core.CQRS;
using Domain.AI.Dto;
using Domain.Integrations.Gemini;
using Domain.Integrations.Gemini.Dto;
using Domain.Users.Enums;

namespace Domain.AI.Queries;

public record GetAiResponseQuery(AiGeneratedDishProperties Props) : IQuery<string>;

internal class GetAiResponseQueryHandler(IAIIntegration integration) : IQueryHandler<GetAiResponseQuery, string>
{
    public async Task<string> Handle(GetAiResponseQuery request, CancellationToken cancellationToken)
    {
        var categoryNames = request.Props.Categories.Select(c => request.Props.Lang switch
        {
            Lang.PL => c.NamePl,
            Lang.DE => c.NameDe,
            Lang.ES => c.NameEs,
            _ => c.NameEn
        });

        var prequest = $"You are a professional chef. Return your response STRICTLY in {request.Props.Lang} language.\r\n" +
                       $"Generate a dish recipe (1 portion) based on these parameters:\r\n" +
                       $"- Categories: {string.Join(", ", categoryNames)}\r\n" +
                       $"- Tastes: {string.Join(", ", request.Props.Tastes)}\r\n" +
                       $"- Available tools: {string.Join(", ", request.Props.RequiredTools)} (optimize recipe for these tools)\r\n\r\n" +
                       $"IMPORTANT: Translate EVERYTHING to {request.Props.Lang}, including:\r\n" +
                       $"- The recipe name\r\n" +
                       $"- The list of categories (use valid names in target language)\r\n" +
                       $"- The list of required tools (use valid names in target language)\r\n" +
                       $"- Ingredient names and units\r\n" +
                       $"- Preparation steps\r\n" +
                       $"- Section headers (e.g., 'Ingredients', 'Preparation Steps', 'Estimates')\r\n\r\n" +
                       $"Please return the response as a valid JSON object with the following structure:\r\n" +
                       $"{{\r\n" +
                       $"  \"name\": \"[Recipe Name]\",\r\n" +
                       $"  \"categories\": [\"[Category 1]\", \"[Category 2]\"],\r\n" +
                       $"  \"ingredients\": [\"[Quantity unit ingredient]\", \"...\"],\r\n" +
                       $"  \"steps\": [\"[Step 1]\", \"[Step 2]\"],\r\n" +
                       $"  \"macros\": {{\r\n" +
                       $"    \"calories\": [number],\r\n" +
                       $"    \"carbs\": [number],\r\n" +
                       $"    \"protein\": [number],\r\n" +
                       $"    \"fat\": [number]\r\n" +
                       $"  }}\r\n" +
                       $"}}\r\n" +
                       $"Do not include any markdown formatting (like ```json). Return RAW JSON only.";

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