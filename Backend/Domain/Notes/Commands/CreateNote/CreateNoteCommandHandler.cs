using Core.CQRS;
using Core.Database;
using Domain.Notes.Entities;
using Domain.Notes.Repositories;
using MediatR;

namespace Domain.Notes.Commands.CreateNote;

internal class CreateNoteCommandHandler(
    INotesRepository notesRepository,
    IUnitOfWork unitOfWork
) : ICommandHandler<CreateNoteCommand, int>
{
    public async Task<int> Handle(CreateNoteCommand command, CancellationToken cancellationToken)
    {
        var note = new Note(command.Title, command.Content, command.UserId);

        notesRepository.Add(note);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return note.Id;
    }
}
