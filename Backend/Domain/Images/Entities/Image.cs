using Core.Database;
using Domain.Users.Entities;

namespace Domain.Images.Entities;

public class Image(string url, int ownerId) : EntityBase
{
    public string Url { get; set; } = url;
    public int OwnerId { get; set; } = ownerId;
    public User Owner { get; set; }
}
