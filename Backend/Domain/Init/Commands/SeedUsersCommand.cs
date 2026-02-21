using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Authentication.Services;
using Domain.Users.Entities;
using Domain.Users.Enums;
using Domain.Users.Repositories;
using MediatR;

namespace Domain.Init.Commands;

public record SeedUsersCommand : ICommand<Unit>;

internal sealed class AddInitUsersCommandHandler(
    IUserRepository userRepository,
    IAuthService authService,
    IUnitOfWork unitOfWork) : ICommandHandler<SeedUsersCommand, Unit>
{
    public async Task<Unit> Handle(SeedUsersCommand command, CancellationToken cancellationToken)
    {
        var password = "Password123$d";
        var passwordHash = authService.HashPassword(password);

        var user = new User(
            "user@example.com",
            passwordHash,
            UserRole.Admin,
            "User",
            23
        );

        var user2 = new User(
            "user2@example.com",
            passwordHash,
            UserRole.Employee,
            "User2",
            23
        );

        var user3 = new User(
            "user3@example.com",
            passwordHash,
            UserRole.User,
            "User3",
            23
        );

        var usersExists = await userRepository
            .AnyAsync(u => u.Email == user.Email
                           || u.Email == user2.Email
                           || u.Email == user3.Email, cancellationToken);
        if (usersExists)
            throw new DomainException("Any of users exists", (int)UserErrorCode.EntityExists);

        userRepository.Add(user);
        userRepository.Add(user2);
        userRepository.Add(user3);

        await unitOfWork.SaveChangesAsync(CancellationToken.None);

        return Unit.Value;
    }
}