using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kratos.Server.Migrations
{
    /// <inheritdoc />
    public partial class dbKratos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ActividadEconomica",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    codigoCiiu = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    categoria = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActividadEconomica", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Categoria",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    categoriapadreId = table.Column<int>(type: "int", nullable: true),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ImagenUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActualizadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categoria", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Categoria_Categoria_categoriapadreId",
                        column: x => x.categoriapadreId,
                        principalTable: "Categoria",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Modulo",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Modulo", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "RegimenTributario",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    descripcion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    codigo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    estado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegimenTributario", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "TipoSociedad",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    codigo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoSociedad", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Empresa",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    contraseña = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    confirmarContraseña = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    tiposociedadId = table.Column<int>(type: "int", nullable: false),
                    actividadId = table.Column<int>(type: "int", nullable: false),
                    regimenId = table.Column<int>(type: "int", nullable: false),
                    token = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    razonSocial = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    nombreComercial = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    nit = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    dv = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    telefono = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    representanteLegal = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    activo = table.Column<bool>(type: "bit", nullable: false),
                    creadoEn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    actualizadoEn = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empresa", x => x.id);
                    table.ForeignKey(
                        name: "FK_Empresa_ActividadEconomica_actividadId",
                        column: x => x.actividadId,
                        principalTable: "ActividadEconomica",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Empresa_RegimenTributario_regimenId",
                        column: x => x.regimenId,
                        principalTable: "RegimenTributario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Empresa_TipoSociedad_tiposociedadId",
                        column: x => x.tiposociedadId,
                        principalTable: "TipoSociedad",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Proveedor",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    empresaId = table.Column<int>(type: "int", nullable: false),
                    nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    telefono = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    direccion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Proveedor", x => x.id);
                    table.ForeignKey(
                        name: "FK_Proveedor_Empresa_empresaId",
                        column: x => x.empresaId,
                        principalTable: "Empresa",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Rol",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    empresaId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rol", x => x.id);
                    table.ForeignKey(
                        name: "FK_Rol_Empresa_empresaId",
                        column: x => x.empresaId,
                        principalTable: "Empresa",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TratamientoEmpresa",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    empresaId = table.Column<int>(type: "int", nullable: false),
                    categoriaProductoId = table.Column<int>(type: "int", nullable: false),
                    porcentaje = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TratamientoEmpresa", x => x.id);
                    table.ForeignKey(
                        name: "FK_TratamientoEmpresa_Categoria_categoriaProductoId",
                        column: x => x.categoriaProductoId,
                        principalTable: "Categoria",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TratamientoEmpresa_Empresa_empresaId",
                        column: x => x.empresaId,
                        principalTable: "Empresa",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Permiso",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    rolesId = table.Column<int>(type: "int", nullable: false),
                    modulosId = table.Column<int>(type: "int", nullable: false),
                    nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    descripcion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    codigo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    consultar = table.Column<bool>(type: "bit", nullable: false),
                    leer = table.Column<bool>(type: "bit", nullable: false),
                    insertar = table.Column<bool>(type: "bit", nullable: false),
                    editar = table.Column<bool>(type: "bit", nullable: false),
                    eliminar = table.Column<bool>(type: "bit", nullable: false),
                    importar = table.Column<bool>(type: "bit", nullable: false),
                    exportar = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permiso", x => x.id);
                    table.ForeignKey(
                        name: "FK_Permiso_Modulo_modulosId",
                        column: x => x.modulosId,
                        principalTable: "Modulo",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Permiso_Rol_rolesId",
                        column: x => x.rolesId,
                        principalTable: "Rol",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Usuario",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    rolesId = table.Column<int>(type: "int", nullable: false),
                    contraseña = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    confirmarContraseña = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    token = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    nombres = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    apellidos = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    telefono = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    estado = table.Column<bool>(type: "bit", nullable: false),
                    creadoEn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    actualizadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuario", x => x.id);
                    table.ForeignKey(
                        name: "FK_Usuario_Rol_rolesId",
                        column: x => x.rolesId,
                        principalTable: "Rol",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Impuesto",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tratamientoId = table.Column<int>(type: "int", nullable: false),
                    nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    descripcion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    codigo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    porcentaje = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Impuesto", x => x.id);
                    table.ForeignKey(
                        name: "FK_Impuesto_TratamientoEmpresa_tratamientoId",
                        column: x => x.tratamientoId,
                        principalTable: "TratamientoEmpresa",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Producto",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    codigo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    impuestoId = table.Column<int>(type: "int", nullable: false),
                    nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    categoriaId = table.Column<int>(type: "int", nullable: false),
                    precio = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    costo = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    stockMinimo = table.Column<int>(type: "int", nullable: false),
                    imagenUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    activo = table.Column<bool>(type: "bit", nullable: false),
                    creadoEn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    actualizadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Producto", x => x.id);
                    table.ForeignKey(
                        name: "FK_Producto_Categoria_categoriaId",
                        column: x => x.categoriaId,
                        principalTable: "Categoria",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Producto_TratamientoEmpresa_impuestoId",
                        column: x => x.impuestoId,
                        principalTable: "TratamientoEmpresa",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PuntoVenta",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    direccion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    telefono = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    responsableId = table.Column<int>(type: "int", nullable: false),
                    activo = table.Column<bool>(type: "bit", nullable: false),
                    creadoEn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    actualizadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PuntoVenta", x => x.id);
                    table.ForeignKey(
                        name: "FK_PuntoVenta_Usuario_responsableId",
                        column: x => x.responsableId,
                        principalTable: "Usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "impuestoProducto",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    impuestoId = table.Column<int>(type: "int", nullable: false),
                    productoId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_impuestoProducto", x => x.id);
                    table.ForeignKey(
                        name: "FK_impuestoProducto_Impuesto_impuestoId",
                        column: x => x.impuestoId,
                        principalTable: "Impuesto",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_impuestoProducto_Producto_productoId",
                        column: x => x.productoId,
                        principalTable: "Producto",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Compra",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    puntoVentaId = table.Column<int>(type: "int", nullable: false),
                    proveedorId = table.Column<int>(type: "int", nullable: true),
                    solicitanteId = table.Column<int>(type: "int", nullable: true),
                    fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    numeroFactura = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    tipoCompra = table.Column<int>(type: "int", nullable: false),
                    tipoPago = table.Column<int>(type: "int", nullable: false),
                    estado = table.Column<int>(type: "int", nullable: false),
                    activo = table.Column<bool>(type: "bit", nullable: false),
                    estaCancelada = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Compra", x => x.id);
                    table.ForeignKey(
                        name: "FK_Compra_Proveedor_proveedorId",
                        column: x => x.proveedorId,
                        principalTable: "Proveedor",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Compra_PuntoVenta_puntoVentaId",
                        column: x => x.puntoVentaId,
                        principalTable: "PuntoVenta",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Compra_Usuario_solicitanteId",
                        column: x => x.solicitanteId,
                        principalTable: "Usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Inventario",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    productoId = table.Column<int>(type: "int", nullable: false),
                    puntoventaId = table.Column<int>(type: "int", nullable: false),
                    cantidad = table.Column<int>(type: "int", nullable: false),
                    creadoEn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    actualizadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inventario", x => x.id);
                    table.ForeignKey(
                        name: "FK_Inventario_Producto_productoId",
                        column: x => x.productoId,
                        principalTable: "Producto",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Inventario_PuntoVenta_puntoventaId",
                        column: x => x.puntoventaId,
                        principalTable: "PuntoVenta",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Venta",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    puntoVentaId = table.Column<int>(type: "int", nullable: false),
                    clienteId = table.Column<int>(type: "int", nullable: true),
                    vendedorId = table.Column<int>(type: "int", nullable: true),
                    fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    numeroFactura = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    tipoVenta = table.Column<int>(type: "int", nullable: false),
                    tipoPago = table.Column<int>(type: "int", nullable: false),
                    estado = table.Column<int>(type: "int", nullable: false),
                    activo = table.Column<bool>(type: "bit", nullable: false),
                    estaCancelada = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Venta", x => x.id);
                    table.ForeignKey(
                        name: "FK_Venta_PuntoVenta_puntoVentaId",
                        column: x => x.puntoVentaId,
                        principalTable: "PuntoVenta",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Venta_Usuario_clienteId",
                        column: x => x.clienteId,
                        principalTable: "Usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Venta_Usuario_vendedorId",
                        column: x => x.vendedorId,
                        principalTable: "Usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Pedido",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    compraId = table.Column<int>(type: "int", nullable: false),
                    productoId = table.Column<int>(type: "int", nullable: false),
                    precioUnitario = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    cantidad = table.Column<int>(type: "int", nullable: false),
                    porcentajeInpuesto = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    porcentajeDescuento = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    subTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pedido", x => x.id);
                    table.ForeignKey(
                        name: "FK_Pedido_Compra_compraId",
                        column: x => x.compraId,
                        principalTable: "Compra",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Pedido_Producto_productoId",
                        column: x => x.productoId,
                        principalTable: "Producto",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "POS",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ventaId = table.Column<int>(type: "int", nullable: false),
                    productoId = table.Column<int>(type: "int", nullable: false),
                    precioUnitario = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    cantidad = table.Column<int>(type: "int", nullable: false),
                    porcentajeInpuesto = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    porcentajeDescuento = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    subTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_POS", x => x.id);
                    table.ForeignKey(
                        name: "FK_POS_Producto_productoId",
                        column: x => x.productoId,
                        principalTable: "Producto",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_POS_Venta_ventaId",
                        column: x => x.ventaId,
                        principalTable: "Venta",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categoria_categoriapadreId",
                table: "Categoria",
                column: "categoriapadreId");

            migrationBuilder.CreateIndex(
                name: "IX_Compra_proveedorId",
                table: "Compra",
                column: "proveedorId");

            migrationBuilder.CreateIndex(
                name: "IX_Compra_puntoVentaId",
                table: "Compra",
                column: "puntoVentaId");

            migrationBuilder.CreateIndex(
                name: "IX_Compra_solicitanteId",
                table: "Compra",
                column: "solicitanteId");

            migrationBuilder.CreateIndex(
                name: "IX_Empresa_actividadId",
                table: "Empresa",
                column: "actividadId");

            migrationBuilder.CreateIndex(
                name: "IX_Empresa_regimenId",
                table: "Empresa",
                column: "regimenId");

            migrationBuilder.CreateIndex(
                name: "IX_Empresa_tiposociedadId",
                table: "Empresa",
                column: "tiposociedadId");

            migrationBuilder.CreateIndex(
                name: "IX_Impuesto_tratamientoId",
                table: "Impuesto",
                column: "tratamientoId");

            migrationBuilder.CreateIndex(
                name: "IX_impuestoProducto_impuestoId",
                table: "impuestoProducto",
                column: "impuestoId");

            migrationBuilder.CreateIndex(
                name: "IX_impuestoProducto_productoId",
                table: "impuestoProducto",
                column: "productoId");

            migrationBuilder.CreateIndex(
                name: "IX_Inventario_productoId",
                table: "Inventario",
                column: "productoId");

            migrationBuilder.CreateIndex(
                name: "IX_Inventario_puntoventaId",
                table: "Inventario",
                column: "puntoventaId");

            migrationBuilder.CreateIndex(
                name: "IX_Pedido_compraId",
                table: "Pedido",
                column: "compraId");

            migrationBuilder.CreateIndex(
                name: "IX_Pedido_productoId",
                table: "Pedido",
                column: "productoId");

            migrationBuilder.CreateIndex(
                name: "IX_Permiso_modulosId",
                table: "Permiso",
                column: "modulosId");

            migrationBuilder.CreateIndex(
                name: "IX_Permiso_rolesId",
                table: "Permiso",
                column: "rolesId");

            migrationBuilder.CreateIndex(
                name: "IX_POS_productoId",
                table: "POS",
                column: "productoId");

            migrationBuilder.CreateIndex(
                name: "IX_POS_ventaId",
                table: "POS",
                column: "ventaId");

            migrationBuilder.CreateIndex(
                name: "IX_Producto_categoriaId",
                table: "Producto",
                column: "categoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Producto_impuestoId",
                table: "Producto",
                column: "impuestoId");

            migrationBuilder.CreateIndex(
                name: "IX_Proveedor_empresaId",
                table: "Proveedor",
                column: "empresaId");

            migrationBuilder.CreateIndex(
                name: "IX_PuntoVenta_responsableId",
                table: "PuntoVenta",
                column: "responsableId");

            migrationBuilder.CreateIndex(
                name: "IX_Rol_empresaId",
                table: "Rol",
                column: "empresaId");

            migrationBuilder.CreateIndex(
                name: "IX_TratamientoEmpresa_categoriaProductoId",
                table: "TratamientoEmpresa",
                column: "categoriaProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_TratamientoEmpresa_empresaId",
                table: "TratamientoEmpresa",
                column: "empresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuario_rolesId",
                table: "Usuario",
                column: "rolesId");

            migrationBuilder.CreateIndex(
                name: "IX_Venta_clienteId",
                table: "Venta",
                column: "clienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Venta_puntoVentaId",
                table: "Venta",
                column: "puntoVentaId");

            migrationBuilder.CreateIndex(
                name: "IX_Venta_vendedorId",
                table: "Venta",
                column: "vendedorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "impuestoProducto");

            migrationBuilder.DropTable(
                name: "Inventario");

            migrationBuilder.DropTable(
                name: "Pedido");

            migrationBuilder.DropTable(
                name: "Permiso");

            migrationBuilder.DropTable(
                name: "POS");

            migrationBuilder.DropTable(
                name: "Impuesto");

            migrationBuilder.DropTable(
                name: "Compra");

            migrationBuilder.DropTable(
                name: "Modulo");

            migrationBuilder.DropTable(
                name: "Producto");

            migrationBuilder.DropTable(
                name: "Venta");

            migrationBuilder.DropTable(
                name: "Proveedor");

            migrationBuilder.DropTable(
                name: "TratamientoEmpresa");

            migrationBuilder.DropTable(
                name: "PuntoVenta");

            migrationBuilder.DropTable(
                name: "Categoria");

            migrationBuilder.DropTable(
                name: "Usuario");

            migrationBuilder.DropTable(
                name: "Rol");

            migrationBuilder.DropTable(
                name: "Empresa");

            migrationBuilder.DropTable(
                name: "ActividadEconomica");

            migrationBuilder.DropTable(
                name: "RegimenTributario");

            migrationBuilder.DropTable(
                name: "TipoSociedad");
        }
    }
}
