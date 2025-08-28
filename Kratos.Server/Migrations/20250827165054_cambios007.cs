using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kratos.Server.Migrations
{
    /// <inheritdoc />
    public partial class cambios007 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "empressaId",
                table: "PuntoVenta",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PuntoVenta_empressaId",
                table: "PuntoVenta",
                column: "empressaId");

            migrationBuilder.AddForeignKey(
                name: "FK_PuntoVenta_Empresa_empressaId",
                table: "PuntoVenta",
                column: "empressaId",
                principalTable: "Empresa",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PuntoVenta_Empresa_empressaId",
                table: "PuntoVenta");

            migrationBuilder.DropIndex(
                name: "IX_PuntoVenta_empressaId",
                table: "PuntoVenta");

            migrationBuilder.DropColumn(
                name: "empressaId",
                table: "PuntoVenta");
        }
    }
}
