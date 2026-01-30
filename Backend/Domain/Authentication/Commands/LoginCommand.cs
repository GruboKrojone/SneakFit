using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Authentication.Dto;
using Domain.Authentication.Entities;
using Domain.Authentication.Enums;
using Domain.Authentication.Repositories;
using Domain.Authentication.Services;
using Domain.Users.Repositories;
using Microsoft.Extensions.Configuration;

namespace Domain.Authentication.Commands;

public record LoginCommand(LoginParams Input) : ICommand<LoginResponse>;

internal sealed class LoginCommandHandler(
    IUserRepository userRepository,
    IRefreshTokenRepository refreshTokenRepository,
    IAuthService authService,
    IConfiguration configuration,
    IUnitOfWork unitOfWork
) : ICommandHandler<LoginCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.FindByEmailAsync(request.Input.Email, cancellationToken)
                   ?? throw new DomainException("User or password is incorrect",
                       (int)AuthErrorCode.InvalidData);

        if (!authService.VerifyPassword(request.Input.Password, user.Password))
            throw new DomainException("User or password is incorrect",
                (int)AuthErrorCode.InvalidData);

        var accessToken = authService.GenerateToken(user.Email, user.Role, user.Id);
        var refreshTokenValue = authService.GenerateRefreshToken();

        var RefreshTokenExpireDays = int.Parse(configuration["App:Authentication:RefreshTokenExpireDays"]
                                               ?? throw new DomainException("RefreshTokenExpireDays not configured",
                                                   (int)AuthErrorCode.JwtExpireHoursNotConfigured));

        var refreshToken = new RefreshToken(
            refreshTokenValue,
            user.Id,
            DateTime.UtcNow.AddDays(RefreshTokenExpireDays)
        );

        await refreshTokenRepository.AddAsync(refreshToken, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new LoginResponse(
            user.Id,
            user.Email,
            user.Role,
            accessToken,
            refreshTokenValue
        );
    }
}