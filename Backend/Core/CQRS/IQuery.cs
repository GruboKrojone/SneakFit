using MediatR;

namespace Core.CQRS;

public interface IQuery<T> : IRequest<T> { }