using Core.CQRS;
using Core.Database;
using Core.Middlewares;
using Domain.Users.Enums;
using Domain.Users.Repositories;
using MediatR;

namespace Domain.Users.Commands;

public record SetUserLangCommand(int UserId, Lang Lang) : ICommand<Unit>;

internal sealed class SetUserLangCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork) : ICommandHandler<SetUserLangCommand, Unit>
{
    public async Task<Unit> Handle(SetUserLangCommand command, CancellationToken cancellationToken)
    {
        var user = await userRepository.FindAsync(command.UserId, cancellationToken)
                   ?? throw new DomainException($"User not found", (int)UserErrorCode.UserNotFound);

        user.SetApplicationLang(command.Lang);
        userRepository.Update(user);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
