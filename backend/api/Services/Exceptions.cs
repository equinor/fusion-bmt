using System;

public class NotFoundInDBException : Exception
{
    public NotFoundInDBException()
    {
    }

    public NotFoundInDBException(string message)
        : base(message)
    {
    }

    public NotFoundInDBException(string message, Exception inner)
        : base(message, inner)
    {
    }
}
