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

public class ProgressionTransitionException : Exception
{
    public ProgressionTransitionException()
    {
    }

    public ProgressionTransitionException(string message)
        : base(message)
    {
    }

    public ProgressionTransitionException(string message, Exception inner)
        : base(message, inner)
    {
    }
}
