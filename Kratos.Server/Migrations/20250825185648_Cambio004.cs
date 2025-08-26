using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kratos.Server.Migrations
{
    /// <inheritdoc />
    public partial class Cambio004 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Producto_Impuesto_impuestoId",
                table: "Producto");

            migrationBuilder.DropIndex(
                name: "IX_Producto_impuestoId",
                table: "Producto");

            migrationBuilder.DropColumn(
                name: "impuestoId",
                table: "Producto");

            migrationBuilder.AddColumn<int>(
                name: "subCategoriaId",
                table: "Producto",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Producto_subCategoriaId",
                table: "Producto",
                column: "subCategoriaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Producto_Categoria_subCategoriaId",
                table: "Producto",
                column: "subCategoriaId",
                principalTable: "Categoria",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Producto_Categoria_subCategoriaId",
                table: "Producto");

            migrationBuilder.DropIndex(
                name: "IX_Producto_subCategoriaId",
                table: "Producto");

            migrationBuilder.DropColumn(
                name: "subCategoriaId",
                table: "Producto");

            migrationBuilder.AddColumn<int>(
                name: "impuestoId",
                table: "Producto",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Producto_impuestoId",
                table: "Producto",
                column: "impuestoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Producto_Impuesto_impuestoId",
                table: "Producto",
                column: "impuestoId",
                principalTable: "Impuesto",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
