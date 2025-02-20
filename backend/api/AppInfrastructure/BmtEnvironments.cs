namespace api.AppInfrastructure;

public static class BmtEnvironments
{
    public static string CurrentEnvironment { get; set; } = null!;

    private const string LocalDev = "localdev";
    private const string Ci = "CI";
    private const string RadixDev = "radix-dev";
    private const string RadixQa = "radix-qa";
    private const string RadixProd = "radix-prod";

    public static bool UseSqlite => CurrentEnvironment is LocalDev;
    public static bool ShowDebugInfo => CurrentEnvironment is LocalDev or Ci or RadixDev;
    public static bool ReturnExceptionDetails => CurrentEnvironment is not RadixProd;
    public static bool AllowMigrationsToBeApplied => CurrentEnvironment is RadixDev or RadixQa or RadixProd;

    public static string FusionEnvironment => CurrentEnvironment switch
    {
        RadixProd => "FPRD",
        RadixQa => "FQA",
        _ => "CI"
    };
}
