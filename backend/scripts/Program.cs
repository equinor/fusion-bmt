using System;
using System.CommandLine;
using System.CommandLine.Invocation;

namespace scripts
{
    static class Program
    {
        public static int Main(string[] args)
        {
            var rootCommand = new RootCommand();

            var qtCommand = new Command(
                "--order-templates",
                description: "Order question templates"
            );
            qtCommand.AddAlias("-ot");
            qtCommand.AddArgument(new Argument<string>("question-file"));
            qtCommand.Handler = CommandHandler.Create<string>((questionFile) =>
            {
                Console.WriteLine("Ordering question templates");
                DbHandler dbHandler = new DbHandler();
                dbHandler.OrderQuestionTemplates(questionFile);
            });
            rootCommand.AddCommand(qtCommand);

            var qfCommand = new Command(
                "--templates",
                description: "JSON-file with questions"
            );
            qfCommand.AddAlias("-t");
            qfCommand.AddArgument(new Argument<string>("question-file"));
            qfCommand.Handler = CommandHandler.Create<string>((questionFile) =>
            {
                Console.WriteLine($"The given input is: {questionFile}");
                DbHandler dbHandler = new DbHandler();
                dbHandler.PopulateQuestionTemplate(questionFile);
            });
            rootCommand.AddCommand(qfCommand);

            var oqCommand = new Command(
                "--order-questions",
                description: "Order questions in given evaluation"
            );
            oqCommand.AddAlias("-oq");
            oqCommand.AddArgument(new Argument<string>("evaluation-id"));
            oqCommand.Handler = CommandHandler.Create<string>((evaluationId) =>
            {
                Console.WriteLine($"Ordering questions for evaluation: {evaluationId}");
                DbHandler dbHandler = new DbHandler();
                dbHandler.OrderQuestionsInEvaluation(evaluationId);
            });
            rootCommand.AddCommand(oqCommand);

            rootCommand.Description = "Various scripts for DB handling";

            return rootCommand.InvokeAsync(args).Result;
        }
    }
}
