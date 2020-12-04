using System;
using HotChocolate;

namespace api.GQL
{
    class ErrorFilter : IErrorFilter
    {
        public IError OnError(IError error)
        {
            if (error.Exception != null)
            {
                Console.WriteLine(error.Exception.ToString());
                return error.WithMessage(error.Exception.Message);
            }
            else
            {
                return error;
            }
        }
    }
}
