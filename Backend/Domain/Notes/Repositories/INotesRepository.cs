using Core.Authentication;
using Core.Database;
using Domain.Notes.Entities;

namespace Domain.Notes.Repositories;

public interface INotesRepository
{
    void Add(Note note);
}
