using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations
{
    public partial class PreviousEvaluationId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PreviousEvaluationId",
                table: "Evaluations",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PreviousEvaluationId",
                table: "Evaluations");
        }
    }
}
