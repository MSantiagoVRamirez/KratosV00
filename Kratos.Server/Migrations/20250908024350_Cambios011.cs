using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kratos.Server.Migrations
{
    /// <inheritdoc />
    public partial class Cambios011 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "recibido",
                table: "Compra",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "Recepcion",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    compraId = table.Column<int>(type: "int", nullable: false),
                    fechaHora = table.Column<DateTime>(type: "datetime2", nullable: false),
                    entregadoPor = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    usuarioId = table.Column<int>(type: "int", nullable: true),
                    creadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recepcion", x => x.id);
                    table.ForeignKey(
                        name: "FK_Recepcion_Compra_compraId",
                        column: x => x.compraId,
                        principalTable: "Compra",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Recepcion_Usuario_usuarioId",
                        column: x => x.usuarioId,
                        principalTable: "Usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RecepcionDetalle",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    recepcionId = table.Column<int>(type: "int", nullable: false),
                    pedidoId = table.Column<int>(type: "int", nullable: false),
                    completo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecepcionDetalle", x => x.id);
                    table.ForeignKey(
                        name: "FK_RecepcionDetalle_Pedido_pedidoId",
                        column: x => x.pedidoId,
                        principalTable: "Pedido",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecepcionDetalle_Recepcion_recepcionId",
                        column: x => x.recepcionId,
                        principalTable: "Recepcion",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Recepcion_compraId",
                table: "Recepcion",
                column: "compraId");

            migrationBuilder.CreateIndex(
                name: "IX_Recepcion_usuarioId",
                table: "Recepcion",
                column: "usuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionDetalle_pedidoId",
                table: "RecepcionDetalle",
                column: "pedidoId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionDetalle_recepcionId",
                table: "RecepcionDetalle",
                column: "recepcionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RecepcionDetalle");

            migrationBuilder.DropTable(
                name: "Recepcion");

            migrationBuilder.DropColumn(
                name: "recibido",
                table: "Compra");
        }
    }
}
