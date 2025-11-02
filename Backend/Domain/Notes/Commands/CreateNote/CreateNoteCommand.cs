using MediatR;
using Core.CQRS;

namespace Domain.Notes.Commands.CreateNote;

public record CreateNoteCommand(string Title, string Content, int UserId) : ICommand<int>;
