using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kratos.Server.Migrations
{
    /// <inheritdoc />
    public partial class cambio003 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImagenUrl",
                table: "Empresa",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImagenUrl",
                table: "Empresa");
        }
    }
}
