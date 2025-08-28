using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kratos.Server.Migrations
{
    /// <inheritdoc />
    public partial class Cambio005 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "imagenUrl",
                table: "Producto",
                newName: "ImagenUrl");

            migrationBuilder.AddColumn<bool>(
                name: "ProductoServicio",
                table: "Producto",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProductoServicio",
                table: "Producto");

            migrationBuilder.RenameColumn(
                name: "ImagenUrl",
                table: "Producto",
                newName: "imagenUrl");
        }
    }
}
