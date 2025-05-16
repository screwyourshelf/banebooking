using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Banebooking.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Brukere",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Sub = table.Column<string>(type: "text", nullable: false),
                    Epost = table.Column<string>(type: "text", nullable: false),
                    Navn = table.Column<string>(type: "text", nullable: true),
                    Provider = table.Column<string>(type: "text", nullable: false),
                    OpprettetTid = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brukere", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Klubber",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    Navn = table.Column<string>(type: "text", nullable: false),
                    KontaktEpost = table.Column<string>(type: "text", nullable: false),
                    AdminEpost = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Klubber", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Baner",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KlubbId = table.Column<Guid>(type: "uuid", nullable: false),
                    Navn = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    Beskrivelse = table.Column<string>(type: "text", nullable: true),
                    Aktiv = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Baner", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Baner_Klubber_KlubbId",
                        column: x => x.KlubbId,
                        principalTable: "Klubber",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BookingRegler",
                columns: table => new
                {
                    KlubbId = table.Column<Guid>(type: "uuid", nullable: false),
                    Åpningstid = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    Stengetid = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    MaksBookingerPerDagPerBruker = table.Column<int>(type: "integer", nullable: false),
                    SlotLengde = table.Column<TimeSpan>(type: "interval", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingRegler", x => x.KlubbId);
                    table.ForeignKey(
                        name: "FK_BookingRegler_Klubber_KlubbId",
                        column: x => x.KlubbId,
                        principalTable: "Klubber",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Roller",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KlubbId = table.Column<Guid>(type: "uuid", nullable: false),
                    Epost = table.Column<string>(type: "text", nullable: false),
                    Rolle = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roller", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Roller_Klubber_KlubbId",
                        column: x => x.KlubbId,
                        principalTable: "Klubber",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Bookinger",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BaneId = table.Column<Guid>(type: "uuid", nullable: false),
                    BrukerId = table.Column<Guid>(type: "uuid", nullable: true),
                    Dato = table.Column<DateOnly>(type: "date", nullable: false),
                    StartTid = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    SluttTid = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Kansellert = table.Column<bool>(type: "boolean", nullable: false),
                    KansellertTidspunkt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    KansellertAv = table.Column<string>(type: "text", nullable: true),
                    VarsletOmKansellering = table.Column<bool>(type: "boolean", nullable: false),
                    Kommentar = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookinger", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookinger_Baner_BaneId",
                        column: x => x.BaneId,
                        principalTable: "Baner",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bookinger_Brukere_BrukerId",
                        column: x => x.BrukerId,
                        principalTable: "Brukere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Baner_KlubbId_Navn",
                table: "Baner",
                columns: new[] { "KlubbId", "Navn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookinger_BaneId_Dato_StartTid",
                table: "Bookinger",
                columns: new[] { "BaneId", "Dato", "StartTid" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookinger_BrukerId",
                table: "Bookinger",
                column: "BrukerId");

            migrationBuilder.CreateIndex(
                name: "IX_Roller_KlubbId_Epost",
                table: "Roller",
                columns: new[] { "KlubbId", "Epost" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookinger");

            migrationBuilder.DropTable(
                name: "BookingRegler");

            migrationBuilder.DropTable(
                name: "Roller");

            migrationBuilder.DropTable(
                name: "Baner");

            migrationBuilder.DropTable(
                name: "Brukere");

            migrationBuilder.DropTable(
                name: "Klubber");
        }
    }
}
