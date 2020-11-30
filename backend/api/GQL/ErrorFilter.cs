using System;
using HotChocolate;

namespace api.GQL
{
    class ErrorFilter : IErrorFilter
    {
        public IError OnError(IError error)
        {
            Console.WriteLine(error.Exception.ToString());
            return error.WithMessage(error.Exception.Message);
        }
    }
}
