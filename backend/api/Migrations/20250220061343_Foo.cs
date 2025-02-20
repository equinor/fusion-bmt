using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class Foo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "IndicatorEvaluationId",
                table: "Projects",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Foo",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Projects_IndicatorEvaluationId",
                table: "Projects",
                column: "IndicatorEvaluationId",
                unique: true,
                filter: "[IndicatorEvaluationId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Answers_Severity",
                table: "Answers",
                column: "Severity");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Projects_IndicatorEvaluationId",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Answers_Severity",
                table: "Answers");

            migrationBuilder.DropColumn(
                name: "Foo",
                table: "Projects");

            migrationBuilder.AlterColumn<string>(
                name: "IndicatorEvaluationId",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);
        }
    }
}
