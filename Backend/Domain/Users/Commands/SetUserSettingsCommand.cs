using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Users.Dtos;
using Domain.Users.Enums;
using Domain.Users.Repositories;
using MediatR;

namespace Domain.Users.Commands;

public record SetUserSettingsCommand(int UserId, UserSettings Settings) : ICommand<Unit>;

internal class SetUserSettingsCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<SetUserSettingsCommand, Unit>
{
    public async Task<Unit> Handle(SetUserSettingsCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.FindAsync(request.UserId, cancellationToken)
            ?? throw new DomainException("User not found", (int)UserErrorCode.UserNotFound);

        if (request.Settings.Name is null || request.Settings.Age is null)
            return Unit.Value;

        user.UpdateProfile(
            request.Settings.Name ?? user.Name,
            request.Settings.Age ?? user.Age
            );

        userRepository.Update(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

