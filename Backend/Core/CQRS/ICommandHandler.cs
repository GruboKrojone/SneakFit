using MediatR;

namespace Core.CQRS;

public interface ICommandHandler<T, E> : IRequestHandler<T, E> where T : ICommand<E> { }