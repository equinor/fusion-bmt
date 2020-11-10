using System;
using System.CommandLine;
using System.CommandLine.Invocation;

namespace scripts
{
    static class Program
    {
        public static int Main(string[] args)
        {
            var rootCommand = new RootCommand
            {
                new Option<string>(
                    "--question-file",
                    description: "JSON-file with questions"
                )
            };

            rootCommand.Description = "Various scripts for DB handling";

            rootCommand.Handler = CommandHandler.Create<string>((questionFile) =>
            {
                Console.WriteLine($"The given input is: {questionFile}");
                DbHandler dbHandler = new DbHandler();
                dbHandler.PopulateQuestionTemplate(questionFile);
            });

            return rootCommand.InvokeAsync(args).Result;
        }
    }
}
