using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kratos.Server.Migrations
{
    /// <inheritdoc />
    public partial class Cambios009 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PuntoVenta_Empresa_empressaId",
                table: "PuntoVenta");

            migrationBuilder.RenameColumn(
                name: "empressaId",
                table: "PuntoVenta",
                newName: "empresaId");

            migrationBuilder.RenameIndex(
                name: "IX_PuntoVenta_empressaId",
                table: "PuntoVenta",
                newName: "IX_PuntoVenta_empresaId");

            migrationBuilder.AddForeignKey(
                name: "FK_PuntoVenta_Empresa_empresaId",
                table: "PuntoVenta",
                column: "empresaId",
                principalTable: "Empresa",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PuntoVenta_Empresa_empresaId",
                table: "PuntoVenta");

            migrationBuilder.RenameColumn(
                name: "empresaId",
                table: "PuntoVenta",
                newName: "empressaId");

            migrationBuilder.RenameIndex(
                name: "IX_PuntoVenta_empresaId",
                table: "PuntoVenta",
                newName: "IX_PuntoVenta_empressaId");

            migrationBuilder.AddForeignKey(
                name: "FK_PuntoVenta_Empresa_empressaId",
                table: "PuntoVenta",
                column: "empressaId",
                principalTable: "Empresa",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
