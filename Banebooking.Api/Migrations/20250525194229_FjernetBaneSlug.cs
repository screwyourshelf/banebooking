using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Banebooking.Api.Migrations
{
    /// <inheritdoc />
    public partial class FjernetBaneSlug : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Baner");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Baner",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
