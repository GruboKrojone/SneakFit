namespace Core.Middlewares;

public class DomainException(string message, int errorCode) : Exception(message)
{
    public int ErrorCode { get; } = errorCode;
}