using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Core.CQRS.Behaviors;

public sealed class TransactionPipelineBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : ICommand<TResponse>
{
    private readonly DbContext _dbContext;
    private readonly ILogger<TransactionPipelineBehavior<TRequest, TResponse>> _logger;

    public TransactionPipelineBehavior(
        DbContext dbContext,
        ILogger<TransactionPipelineBehavior<TRequest, TResponse>> logger)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                _logger.LogInformation(
                    "Begin transaction for {CommandName}",
                    typeof(TRequest).Name);

                var response = await next();

                await _dbContext.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                _logger.LogInformation(
                    "Transaction committed for {CommandName}",
                    typeof(TRequest).Name);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Transaction failed for {CommandName}, rolling back",
                    typeof(TRequest).Name);

                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        });
    }
}