using System.ComponentModel.DataAnnotations;

public record CreateNoteParams
{
    public CreateNoteParams(string title, string content)
    {
        Title = title;
        Content = content;
    }


    [Required] public string Title { get; }
    [Required] public string Content { get; }
}