using MediatR;

namespace Core.CQRS;

public interface IQueryHandler<T, E> : IRequestHandler<T, E> where T : IQuery<E> { }