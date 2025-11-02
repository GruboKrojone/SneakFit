using MediatR;

namespace SneakFit.Backend.Core.Notes.Commands.CreateNote;

public record CreateNoteCommand(string Title, string Content, int UserId) : IRequest<int>;
