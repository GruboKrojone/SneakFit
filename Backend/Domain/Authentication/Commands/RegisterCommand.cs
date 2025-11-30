using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Authentication.Dto;
using Domain.Authentication.Enums;
using Domain.Users.Entities;
using Domain.Users.Enums;
using Domain.Users.Repositories;

namespace Domain.Authentication.Commands;

public record RegisterCommand(RegisterParams Input) : ICommand<int>;

internal sealed class RegisterCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork
) : ICommandHandler<RegisterCommand, int>
{
    public async Task<int> Handle(RegisterCommand command, CancellationToken cancellationToken)
    {
        var input = command.Input
            ?? throw new DomainException("Invalid input data", (int)AuthErrorCode.InvalidData);

        string password = BCrypt.Net.BCrypt.HashPassword(input.Password, workFactor: 12);

        var user = new User(
            input.Email,
            password,
            UserRole.Admin,
            input.Name,
            input.Age
        );

        if (input.Lang is not null)
        {
            Lang lang = (Lang)input.Lang;
            user.SetApplicationLang(lang);
        }

        userRepository.Add(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return user.Id;
    }
}