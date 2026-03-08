using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Users.Enums;
using Domain.Users.Repositories;
using MediatR;

namespace Domain.Users.Commands;

public record ChangeEmailCommand(int UserId, string NewEmail) : ICommand<Unit>;

internal class ChangeEmailCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<ChangeEmailCommand, Unit>
{
    public async Task<Unit> Handle(ChangeEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.FindAsync(request.UserId, cancellationToken)
            ?? throw new DomainException("User not found", (int)UserErrorCode.UserNotFound);

        if (user.Email == request.NewEmail)
            return Unit.Value;

        var existingUser = await userRepository.FindByEmailAsync(request.NewEmail, cancellationToken);
        if (existingUser is not null)
            throw new DomainException("Email already taken", (int)UserErrorCode.EmailAlreadyTaken);

        user.UpdateEmail(request.NewEmail);
        userRepository.Update(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
