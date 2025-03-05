using System.Security.Cryptography;
using System.Text;
using Core.CQRS;
using Core.Database;
using Domain.Authentication.Dto;
using Domain.Users.Entities;
using Domain.Users.Enums;
using Domain.Users.Repositories;

namespace Domain.Authentication.Commands;

public record RegisterCommand(RegisterParams Input) : ICommand<int>;

internal class RegisterCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork
    ) : ICommandHandler<RegisterCommand, int>
{
    public async Task<int> Handle(RegisterCommand command, CancellationToken cancellationToken)
    {
        var input = command.Input;
        
        using var hmac = new HMACSHA512();
        var user = new User(
            input.Email,
            hmac.ComputeHash(Encoding.UTF8.GetBytes(input.Password)),
            passwordSalt: hmac.Key,
            UserRole.Admin,
            input.Name,
            input.Age
        );

        userRepository.Add(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        return user.Id;
    }
}