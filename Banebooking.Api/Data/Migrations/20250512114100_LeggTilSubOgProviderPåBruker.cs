using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Banebooking.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class LeggTilSubOgProviderPåBruker : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LoginProvider",
                table: "Brukere",
                newName: "Sub");

            migrationBuilder.AddColumn<string>(
                name: "Navn",
                table: "Brukere",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OpprettetTid",
                table: "Brukere",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Provider",
                table: "Brukere",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Navn",
                table: "Brukere");

            migrationBuilder.DropColumn(
                name: "OpprettetTid",
                table: "Brukere");

            migrationBuilder.DropColumn(
                name: "Provider",
                table: "Brukere");

            migrationBuilder.RenameColumn(
                name: "Sub",
                table: "Brukere",
                newName: "LoginProvider");
        }
    }
}
