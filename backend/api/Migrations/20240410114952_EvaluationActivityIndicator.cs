using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    public partial class EvaluationActivityIndicator : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IndicatorEvaluationId",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "IndicatorActivityDate",
                table: "Evaluations",
                type: "datetimeoffset",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IndicatorEvaluationId",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "IndicatorActivityDate",
                table: "Evaluations");
        }
    }
}
