using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Banebooking.Api.Migrations
{
    /// <inheritdoc />
    public partial class ByttTilAktivOgNyIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bookinger_BaneId_Dato_StartTid",
                table: "Bookinger");

            migrationBuilder.RenameColumn(
                name: "Kansellert",
                table: "Bookinger",
                newName: "Aktiv");

            migrationBuilder.CreateIndex(
                name: "IX_Bookinger_BaneId_Dato_StartTid",
                table: "Bookinger",
                columns: new[] { "BaneId", "Dato", "StartTid" },
                unique: true,
                filter: "\"Aktiv\" = TRUE");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bookinger_BaneId_Dato_StartTid",
                table: "Bookinger");

            migrationBuilder.RenameColumn(
                name: "Aktiv",
                table: "Bookinger",
                newName: "Kansellert");

            migrationBuilder.CreateIndex(
                name: "IX_Bookinger_BaneId_Dato_StartTid",
                table: "Bookinger",
                columns: new[] { "BaneId", "Dato", "StartTid" },
                unique: true);
        }
    }
}
