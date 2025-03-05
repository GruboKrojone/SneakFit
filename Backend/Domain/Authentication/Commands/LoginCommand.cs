using Core.CQRS;
using Core.Middlewares;
using Domain.Authentication.Dto;
using Domain.Authentication.Enums;
using Domain.Authentication.Services;
using Domain.Users.Repositories;

namespace Domain.Authentication.Commands;

public record LoginCommand(LoginParams Input) : ICommand<LoginResponse>;

internal class LoginCommandHandler(
    IUserRepository userRepository,
    IAuthService authService
) : ICommandHandler<LoginCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = (await userRepository.FindByEmailAsync(request.Input.Email, cancellationToken))
                   ?? throw new DomainException("User or password is incorrect",
                       (int)AuthErrorCode.InvalidData);

        {
            var hash = authService.ComputePasswordHash(request.Input.Password, user.PasswordSalt);
            if (user.PasswordHash != null && !hash.SequenceEqual(user.PasswordHash))
                throw new DomainException("User or password is incorrect",
                    (int)AuthErrorCode.InvalidData);
        }
        
        var token = authService.GenerateToken(user.Email, user.Role, user.Id);

        return new LoginResponse(
            user.Id,
            user.Email,
            user.Role,
            token
        );
    }
}