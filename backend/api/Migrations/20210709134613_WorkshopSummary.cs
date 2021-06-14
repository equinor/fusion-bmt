using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations
{
    public partial class WorkshopSummary : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuestionTemplates_QuestionTemplates_previousId",
                table: "QuestionTemplates");

            migrationBuilder.RenameColumn(
                name: "previousId",
                table: "QuestionTemplates",
                newName: "previousIdId");

            migrationBuilder.RenameIndex(
                name: "IX_QuestionTemplates_previousId",
                table: "QuestionTemplates",
                newName: "IX_QuestionTemplates_previousIdId");

            migrationBuilder.AddColumn<string>(
                name: "Summary",
                table: "Evaluations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_QuestionTemplates_QuestionTemplates_previousIdId",
                table: "QuestionTemplates",
                column: "previousIdId",
                principalTable: "QuestionTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuestionTemplates_QuestionTemplates_previousIdId",
                table: "QuestionTemplates");

            migrationBuilder.DropColumn(
                name: "Summary",
                table: "Evaluations");

            migrationBuilder.RenameColumn(
                name: "previousIdId",
                table: "QuestionTemplates",
                newName: "previousId");

            migrationBuilder.RenameIndex(
                name: "IX_QuestionTemplates_previousIdId",
                table: "QuestionTemplates",
                newName: "IX_QuestionTemplates_previousId");

            migrationBuilder.AddForeignKey(
                name: "FK_QuestionTemplates_QuestionTemplates_previousId",
                table: "QuestionTemplates",
                column: "previousId",
                principalTable: "QuestionTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
