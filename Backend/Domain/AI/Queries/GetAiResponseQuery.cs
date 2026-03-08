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
                       $"Generate a high-quality, creative, and appetizing dish recipe (1 portion) based on these parameters:\r\n" +
                       $"- Categories: {string.Join(", ", categoryNames)}\r\n" +
                       $"- Tastes: {string.Join(", ", request.Props.Tastes.Select(FormatEnumValue))}\r\n" +
                       $"- Available tools: {string.Join(", ", request.Props.RequiredTools.Select(FormatEnumValue))}\r\n\r\n" +
                       $"IMPORTANT: Translate EVERYTHING to {request.Props.Lang}.\r\n" +
                       $"STRICT LENGTH LIMITS (IMPORTANT!):\r\n" +
                       $"- \"name\": MAX 100 characters\r\n" +
                       $"- \"description\": MAX 280 characters\r\n" +
                       $"- each element in \"ingredients\": MAX 100 characters per object\r\n" +
                       $"- each element in \"steps\": MAX 500 characters\r\n\r\n" +
                       $"Please return the response as a valid JSON object. Ensure all strings are properly escaped. Use \\n for multi-line description if needed but keep it under 280 chars total:\r\n" +
                       $"{{\r\n" +
                       $"  \"name\": \"[Name, max 100 chars]\",\r\n" +
                       $"  \"description\": \"[Appetizing desc, max 280 chars]\",\r\n" +
                       $"  \"categories\": [\"[Category 1]\", \"[Category 2]\"],\r\n" +
                       $"  \"ingredients\": [{{ \"name\": \"[Ingredient name]\", \"quantity\": \"[Amount and optional notes]\" }}, ...],\r\n" +
                       $"  \"steps\": [\"[Instruction, max 500 chars]\", \"...\"], \r\n" +
                       $"  \"macros\": {{\r\n" +
                       $"    \"calories\": [number],\r\n" +
                       $"    \"carbs\": [number],\r\n" +
                       $"    \"protein\": [number],\r\n" +
                       $"    \"fat\": [number]\r\n" +
                       $"  }}\r\n" +
                       $"}}\r\n" +
                       $"\r\n" +
                       $"Note for ingredients: Separate the substance name from the amount and unit. For example: {{ \"name\": \"Chicken breast\", \"quantity\": \"200g, diced\" }}\r\n" +
                       $"\r\n" +
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