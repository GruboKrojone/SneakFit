using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Authentication.Dto;
using Domain.Authentication.Enums;
using Domain.Authentication.Repositories;
using MediatR;

namespace Domain.Authentication.Commands;

public record RevokeTokenCommand(RefreshTokenParams Input) : ICommand<Unit>;

internal sealed class RevokeTokenCommandHandler(
    IRefreshTokenRepository refreshTokenRepository,
    IUnitOfWork unitOfWork
) : ICommandHandler<RevokeTokenCommand, Unit>
{
    public async Task<Unit> Handle(RevokeTokenCommand request, CancellationToken cancellationToken)
    {
        var refreshToken = await refreshTokenRepository.FindByTokenAsync(request.Input.RefreshToken, cancellationToken)
                           ?? throw new DomainException("Invalid refresh token",
                               (int)AuthErrorCode.InvalidData);

        if (!refreshToken.IsActive())
            throw new DomainException("Refresh token is already revoked or expired",
                (int)AuthErrorCode.InvalidData);

        refreshToken.Revoke();
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}