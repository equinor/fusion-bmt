using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations
{
    public partial class AddAdminOrderToQuestionTemplate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AdminOrder",
                table: "QuestionTemplates",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminOrder",
                table: "QuestionTemplates");
        }
    }
}
