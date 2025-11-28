using System.Security.Cryptography;
using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Users.Entities;
using Domain.Users.Enums;
using Domain.Users.Repositories;
using MediatR;

namespace Domain.Init.Commands;

public record SeedUsersCommand : ICommand<Unit>;

sealed class AddInitUsersCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<SeedUsersCommand, Unit>
{
    public async Task<Unit> Handle(SeedUsersCommand command, CancellationToken cancellationToken)
    {
        using var hmac = new HMACSHA512();
        var passwordBytes = "Password123$d"u8.ToArray();

        var user = new User(
            "user@example.com",
            hmac.ComputeHash(passwordBytes),
            hmac.Key,
            UserRole.Admin,
            "User",
            23
        );

        var user2 = new User(
            "user2@example.com",
            hmac.ComputeHash(passwordBytes),
            hmac.Key,
            UserRole.Employee,
            "User2",
            23
        );

        var user3 = new User(
            "user3@example.com",
            hmac.ComputeHash(passwordBytes),
            hmac.Key,
            UserRole.User,
            "User3",
            23
        );

        var usersExists = await userRepository
            .AnyAsync(u => u.Email == user.Email
                           || u.Email == user2.Email
                           || user.Email == user3.Email, cancellationToken);
        if (usersExists)
            throw new DomainException("Any of users exists", (int)UserErrorCode.EntityExists);

        userRepository.Add(user);
        userRepository.Add(user2);
        userRepository.Add(user3);

        await unitOfWork.SaveChangesAsync(CancellationToken.None);

        return Unit.Value;
    }
}