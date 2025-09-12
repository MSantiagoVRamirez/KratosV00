using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kratos.Server.Migrations
{
    /// <inheritdoc />
    public partial class Cambios013 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CatalogoItemCarrusel",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    empresaId = table.Column<int>(type: "int", nullable: false),
                    titulo = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    tituloColor = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    imagenUrl = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    orden = table.Column<int>(type: "int", nullable: false),
                    activo = table.Column<bool>(type: "bit", nullable: false),
                    creadoEn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    actualizadoEn = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CatalogoItemCarrusel", x => x.id);
                    table.ForeignKey(
                        name: "FK_CatalogoItemCarrusel_Empresa_empresaId",
                        column: x => x.empresaId,
                        principalTable: "Empresa",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CatalogoProductoConfig",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    empresaId = table.Column<int>(type: "int", nullable: false),
                    productoId = table.Column<int>(type: "int", nullable: false),
                    visible = table.Column<bool>(type: "bit", nullable: false),
                    tituloPersonalizado = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    descripcionPersonalizada = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    palabrasClave = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    creadoEn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    actualizadoEn = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CatalogoProductoConfig", x => x.id);
                    table.ForeignKey(
                        name: "FK_CatalogoProductoConfig_Empresa_empresaId",
                        column: x => x.empresaId,
                        principalTable: "Empresa",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CatalogoProductoConfig_Producto_productoId",
                        column: x => x.productoId,
                        principalTable: "Producto",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CatalogoItemCarrusel_empresaId",
                table: "CatalogoItemCarrusel",
                column: "empresaId");

            migrationBuilder.CreateIndex(
                name: "IX_CatalogoProductoConfig_empresaId",
                table: "CatalogoProductoConfig",
                column: "empresaId");

            migrationBuilder.CreateIndex(
                name: "IX_CatalogoProductoConfig_productoId",
                table: "CatalogoProductoConfig",
                column: "productoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CatalogoItemCarrusel");

            migrationBuilder.DropTable(
                name: "CatalogoProductoConfig");
        }
    }
}
