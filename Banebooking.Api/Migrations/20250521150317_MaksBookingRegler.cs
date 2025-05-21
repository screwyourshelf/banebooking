using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Banebooking.Api.Migrations
{
    /// <inheritdoc />
    public partial class MaksBookingRegler : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AntallDagerFremITidTillatt",
                table: "BookingRegler",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MaksAntallBookingerPerBrukerTotalt",
                table: "BookingRegler",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AntallDagerFremITidTillatt",
                table: "BookingRegler");

            migrationBuilder.DropColumn(
                name: "MaksAntallBookingerPerBrukerTotalt",
                table: "BookingRegler");
        }
    }
}
