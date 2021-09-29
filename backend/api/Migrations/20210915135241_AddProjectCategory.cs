using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations
{
    public partial class AddProjectCategory : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProjectCategories",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProjectCategoryQuestionTemplate",
                columns: table => new
                {
                    ProjectCategoriesId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    QuestionTemplatesId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectCategoryQuestionTemplate", x => new { x.ProjectCategoriesId, x.QuestionTemplatesId });
                    table.ForeignKey(
                        name: "FK_ProjectCategoryQuestionTemplate_ProjectCategories_ProjectCategoriesId",
                        column: x => x.ProjectCategoriesId,
                        principalTable: "ProjectCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectCategoryQuestionTemplate_QuestionTemplates_QuestionTemplatesId",
                        column: x => x.QuestionTemplatesId,
                        principalTable: "QuestionTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectCategoryQuestionTemplate_QuestionTemplatesId",
                table: "ProjectCategoryQuestionTemplate",
                column: "QuestionTemplatesId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectCategoryQuestionTemplate");

            migrationBuilder.DropTable(
                name: "ProjectCategories");
        }
    }
}
