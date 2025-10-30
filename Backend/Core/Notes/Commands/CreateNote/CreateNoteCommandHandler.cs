using System.Threading;
using System.Threading.Tasks;
using Domain.Notes;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Notes.Commands.CreateNote
{
    public class CreateNoteCommandHandler : IRequestHandler<CreateNoteCommand, int>
    {
        private readonly SneakFitDbContext _dbContext;

        public CreateNoteCommandHandler(SneakFitDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<int> Handle(CreateNoteCommand request, CancellationToken cancellationToken)
        {
            var note = new Note
            {
                Title = request.Title,
                Content = request.Content,
                UserId = request.UserId
            };

            _dbContext.Notes.Add(note);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return note.Id;
        }
    }
}
