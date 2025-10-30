using System;

namespace Domain.Notes
{
    public class Note
    {
        public int Id { get; set; }
        public string Title { get; set;}
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int UserID { get; set; }
    }
}
