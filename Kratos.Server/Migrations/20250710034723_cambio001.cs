using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kratos.Server.Migrations
{
    /// <inheritdoc />
    public partial class cambio001 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Producto_TratamientoEmpresa_impuestoId",
                table: "Producto");

            migrationBuilder.AlterColumn<int>(
                name: "impuestoId",
                table: "Producto",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Producto_Impuesto_impuestoId",
                table: "Producto",
                column: "impuestoId",
                principalTable: "Impuesto",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Producto_Impuesto_impuestoId",
                table: "Producto");

            migrationBuilder.AlterColumn<int>(
                name: "impuestoId",
                table: "Producto",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Producto_TratamientoEmpresa_impuestoId",
                table: "Producto",
                column: "impuestoId",
                principalTable: "TratamientoEmpresa",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
