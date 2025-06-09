using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Banebooking.Api.Migrations
{
    /// <inheritdoc />
    public partial class FeedUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FeedUrl",
                table: "Klubber",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FeedUrl",
                table: "Klubber");
        }
    }
}
