using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Authentication.Enums;
using Domain.Authentication.Services;
using Domain.Users.Enums;
using Domain.Users.Repositories;
using MediatR;

namespace Domain.Users.Commands;

public record ChangePasswordCommand(int UserId, string OldPassword, string NewPassword) : ICommand<Unit>;

internal class ChangePasswordCommandHandler(
    IUserRepository userRepository,
    IAuthService authService,
    IUnitOfWork unitOfWork) : ICommandHandler<ChangePasswordCommand, Unit>
{
    public async Task<Unit> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.FindAsync(request.UserId, cancellationToken)
            ?? throw new DomainException("User not found", (int)UserErrorCode.UserNotFound);

        if (!authService.VerifyPassword(request.OldPassword, user.Password))
            throw new DomainException("Invalid password", (int)AuthErrorCode.InvalidData); // Or custom error

        var newPasswordHash = authService.HashPassword(request.NewPassword);
        
        user.UpdatePassword(newPasswordHash);
        
        userRepository.Update(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
