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

public record RefreshTokenCommand(RefreshTokenParams Input) : ICommand<LoginResponse>;

internal sealed class RefreshTokenCommandHandler(
    IRefreshTokenRepository refreshTokenRepository,
    IUserRepository userRepository,
    IAuthService authService,
    IConfiguration configuration,
    IUnitOfWork unitOfWork
) : ICommandHandler<RefreshTokenCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var refreshToken = await refreshTokenRepository.FindByTokenAsync(request.Input.RefreshToken, cancellationToken)
                           ?? throw new DomainException("Invalid refresh token",
                               (int)AuthErrorCode.InvalidData);

        if (!refreshToken.IsActive())
            throw new DomainException("Refresh token is expired or revoked",
                (int)AuthErrorCode.InvalidData);

        var user = await userRepository.FindAsync(refreshToken.UserId, cancellationToken)
                   ?? throw new DomainException("User not found",
                       (int)CommonErrorCode.EntityNotFound);

        refreshToken.Revoke();

        var accessToken = authService.GenerateToken(user.Email, user.Role, user.Id);
        var newRefreshTokenValue = authService.GenerateRefreshToken();

        var RefreshTokenExpireDays = int.Parse(configuration["App:Authentication:RefreshTokenExpireDays"]
                                               ?? throw new DomainException("RefreshTokenExpireDays not configured",
                                                   (int)AuthErrorCode.JwtExpireHoursNotConfigured));

        var newRefreshToken = new RefreshToken(
            newRefreshTokenValue,
            user.Id,
            DateTime.UtcNow.AddDays(RefreshTokenExpireDays)
        );

        await refreshTokenRepository.AddAsync(newRefreshToken, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new LoginResponse(
            user.Id,
            user.Email,
            user.Role,
            accessToken,
            newRefreshTokenValue
        );
    }
}