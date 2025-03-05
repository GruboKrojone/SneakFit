using MediatR;

namespace Core.CQRS;

public interface ICommand<T> : IRequest<T> { }
