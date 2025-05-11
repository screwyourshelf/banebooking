using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Banebooking.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class RestrictDeleteBehaviors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Baner_Klubber_KlubbId",
                table: "Baner");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookinger_Baner_BaneId",
                table: "Bookinger");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookinger_Brukere_BrukerId",
                table: "Bookinger");

            migrationBuilder.DropForeignKey(
                name: "FK_BookingRegler_Klubber_KlubbId",
                table: "BookingRegler");

            migrationBuilder.DropForeignKey(
                name: "FK_FraværsRapporter_Bookinger_BookingId",
                table: "FraværsRapporter");

            migrationBuilder.DropForeignKey(
                name: "FK_FraværsRapporter_Brukere_RapportertAvBrukerId",
                table: "FraværsRapporter");

            migrationBuilder.DropForeignKey(
                name: "FK_Roller_Klubber_KlubbId",
                table: "Roller");

            migrationBuilder.DropIndex(
                name: "IX_Baner_KlubbId",
                table: "Baner");

            migrationBuilder.CreateIndex(
                name: "IX_Baner_KlubbId_Navn",
                table: "Baner",
                columns: new[] { "KlubbId", "Navn" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Baner_Klubber_KlubbId",
                table: "Baner",
                column: "KlubbId",
                principalTable: "Klubber",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookinger_Baner_BaneId",
                table: "Bookinger",
                column: "BaneId",
                principalTable: "Baner",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookinger_Brukere_BrukerId",
                table: "Bookinger",
                column: "BrukerId",
                principalTable: "Brukere",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BookingRegler_Klubber_KlubbId",
                table: "BookingRegler",
                column: "KlubbId",
                principalTable: "Klubber",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FraværsRapporter_Bookinger_BookingId",
                table: "FraværsRapporter",
                column: "BookingId",
                principalTable: "Bookinger",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FraværsRapporter_Brukere_RapportertAvBrukerId",
                table: "FraværsRapporter",
                column: "RapportertAvBrukerId",
                principalTable: "Brukere",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Roller_Klubber_KlubbId",
                table: "Roller",
                column: "KlubbId",
                principalTable: "Klubber",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Baner_Klubber_KlubbId",
                table: "Baner");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookinger_Baner_BaneId",
                table: "Bookinger");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookinger_Brukere_BrukerId",
                table: "Bookinger");

            migrationBuilder.DropForeignKey(
                name: "FK_BookingRegler_Klubber_KlubbId",
                table: "BookingRegler");

            migrationBuilder.DropForeignKey(
                name: "FK_FraværsRapporter_Bookinger_BookingId",
                table: "FraværsRapporter");

            migrationBuilder.DropForeignKey(
                name: "FK_FraværsRapporter_Brukere_RapportertAvBrukerId",
                table: "FraværsRapporter");

            migrationBuilder.DropForeignKey(
                name: "FK_Roller_Klubber_KlubbId",
                table: "Roller");

            migrationBuilder.DropIndex(
                name: "IX_Baner_KlubbId_Navn",
                table: "Baner");

            migrationBuilder.CreateIndex(
                name: "IX_Baner_KlubbId",
                table: "Baner",
                column: "KlubbId");

            migrationBuilder.AddForeignKey(
                name: "FK_Baner_Klubber_KlubbId",
                table: "Baner",
                column: "KlubbId",
                principalTable: "Klubber",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookinger_Baner_BaneId",
                table: "Bookinger",
                column: "BaneId",
                principalTable: "Baner",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookinger_Brukere_BrukerId",
                table: "Bookinger",
                column: "BrukerId",
                principalTable: "Brukere",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BookingRegler_Klubber_KlubbId",
                table: "BookingRegler",
                column: "KlubbId",
                principalTable: "Klubber",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FraværsRapporter_Bookinger_BookingId",
                table: "FraværsRapporter",
                column: "BookingId",
                principalTable: "Bookinger",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FraværsRapporter_Brukere_RapportertAvBrukerId",
                table: "FraværsRapporter",
                column: "RapportertAvBrukerId",
                principalTable: "Brukere",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Roller_Klubber_KlubbId",
                table: "Roller",
                column: "KlubbId",
                principalTable: "Klubber",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
