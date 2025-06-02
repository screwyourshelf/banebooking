using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Banebooking.Api.Migrations
{
    /// <inheritdoc />
    public partial class LeggTilUnikIndexPaaBruker : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Bruker_Epost",
                table: "Brukere",
                column: "Epost",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bruker_Sub",
                table: "Brukere",
                column: "Sub",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bruker_Epost",
                table: "Brukere");

            migrationBuilder.DropIndex(
                name: "IX_Bruker_Sub",
                table: "Brukere");
        }
    }
}
