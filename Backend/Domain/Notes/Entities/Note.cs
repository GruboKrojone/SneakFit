using Microsoft.EntityFrameworkCore;

namespace Domain.Notes.Entities;

public class Note
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int UserId { get; set; }

    public Note() { }

    public Note(string title, string content, int userId)
    {
        Title = title;
        Content = content;
        UserId = userId;
    }

    public static void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Note>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired();
            entity.Property(e => e.Content).IsRequired(false);
            entity.Property(e => e.UserId).IsRequired();
            entity.ToTable("Notes");
        });
    }
}
