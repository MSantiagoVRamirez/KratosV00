using System.Data;
using System.Reflection;
using Kratos.Server.Models.Seguridad;
using Kratos.Server.Models.Ventas;
using Microsoft.EntityFrameworkCore;

namespace Kratos.Server.Models.Contexto
{
    public class KratosContext : DbContext
    {
        public KratosContext(DbContextOptions<KratosContext> options) : base(options)
        {
        }
        public DbSet<ActividadEconomica> ActividadEconomica { get; set; }
        public DbSet<Categoria> Categoria { get; set; }
        public DbSet<Empresa> Empresa { get; set; }
        public DbSet<Impuesto> Impuesto { get; set; }
        public DbSet<Inventario> Inventario { get; set; }
        public DbSet<Modulo> Modulo { get; set; }
        public DbSet<Permiso> Permiso { get; set; }
        public DbSet<Producto> Producto { get; set; }
        public DbSet<PuntoVenta> PuntoVenta { get; set; }
        public DbSet<RegimenTributario> RegimenTributario { get; set; }
        public DbSet<Rol> Rol { get; set; }
        public DbSet<TipoSociedad> TipoSociedad { get; set; }
        public DbSet<TratamientoEmpresa> TratamientoEmpresa { get; set; }
        public DbSet<Usuario> Usuario { get; set; }
        public DbSet<impuestoProducto> impuestoProducto { get; set; }
        public DbSet<Venta> Venta { get; set; }
        public DbSet<POS> POS { get; set; }
        public DbSet<Proveedor> Proveedor { get; set; }
        public DbSet<Compra> Compra { get; set; }
        public DbSet<Pedido> Pedido { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Empresas -> TiposSociedades
            modelBuilder.Entity<Empresa>()
                .HasOne(e => e.empresasociedadFk)
                .WithMany()
                .HasForeignKey(e => e.tiposociedadId)
                .OnDelete(DeleteBehavior.Restrict);

            // Empresas -> ActividadEconomicas
            modelBuilder.Entity<Empresa>()
                .HasOne(e => e.empresaactividadFk)
                .WithMany()
                .HasForeignKey(e => e.actividadId)
                .OnDelete(DeleteBehavior.Restrict);

            // Empresas -> RegimenesTributarios
            modelBuilder.Entity<Empresa>()
                .HasOne(e => e.empresaregimenFk)
                .WithMany()
                .HasForeignKey(e => e.regimenId)
                .OnDelete(DeleteBehavior.Restrict);

            // Roles -> Empresas
            modelBuilder.Entity<Rol>()
                .HasOne(r => r.rolempresaFk)
                .WithMany()
                .HasForeignKey(r => r.empresaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Productos -> Categorias
            modelBuilder.Entity<Producto>()
                .HasOne(p => p.categoriaFk)
                .WithMany()
                .HasForeignKey(p => p.categoriaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Productos -> subCategorias
            modelBuilder.Entity<Producto>()
                .HasOne(p => p.subCategoriaFk)
                .WithMany()
                .HasForeignKey(p => p.subCategoriaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Inventarios -> Productos
            modelBuilder.Entity<Inventario>()
                .HasOne(i => i.productoFk)
                .WithMany()
                .HasForeignKey(i => i.productoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Inventarios -> PuntoVentas
            modelBuilder.Entity<Inventario>()
                .HasOne(i => i.puntoventaFk)
                .WithMany()
                .HasForeignKey(i => i.puntoventaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Impuestos -> RegimenesTributarios
            modelBuilder.Entity<Impuesto>()
                .HasOne(i => i.tratamientoImpuestoFk)
                .WithMany()
                .HasForeignKey(i => i.tratamientoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Permisos -> Roles
            modelBuilder.Entity<Permiso>()
                .HasOne(p => p.permisosrolesId)
                .WithMany()
                .HasForeignKey(p => p.rolesId)
                .OnDelete(DeleteBehavior.Restrict);

            // Permisos -> Modulos
            modelBuilder.Entity<Permiso>()
                .HasOne(p => p.permisosmodulosId)
                .WithMany()
                .HasForeignKey(p => p.modulosId)
                .OnDelete(DeleteBehavior.Restrict);

            // PuntoVentas -> Usuarios
            modelBuilder.Entity<PuntoVenta>()
                .HasOne(pv => pv.usuarioFk)
                .WithMany()
                .HasForeignKey(pv => pv.responsableId)
                .OnDelete(DeleteBehavior.Restrict);

            //PuntoVentas -> empresa
            modelBuilder.Entity<PuntoVenta>()
                .HasOne(pv => pv.empresaSucursalFk)
                .WithMany()
                .HasForeignKey(pv => pv.empresaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Usuarios -> Roles
            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.usuariosrolesFk)
                .WithMany()
                .HasForeignKey(u => u.rolesId)
                .OnDelete(DeleteBehavior.Restrict);

            // TratamientosEmpresas -> Empresas
            modelBuilder.Entity<TratamientoEmpresa>()
                .HasOne(te => te.empresaFk)
                .WithMany()
                .HasForeignKey(te => te.empresaId)
                .OnDelete(DeleteBehavior.Restrict);

            // TratamientosEmpresas -> Categorias
            modelBuilder.Entity<TratamientoEmpresa>()
                .HasOne(te => te.categoriaTratamientoFk)
                .WithMany()
                .HasForeignKey(te => te.categoriaProductoId)
                .OnDelete(DeleteBehavior.Restrict);

            // relacion  -> impuestos
            modelBuilder.Entity<impuestoProducto>()
                .HasOne(te => te.impuestoRelacionFk)
                .WithMany()
                .HasForeignKey(te => te.impuestoId)
                .OnDelete(DeleteBehavior.Restrict);

            // relacion  -> impuestos
            modelBuilder.Entity<impuestoProducto>()
                .HasOne(te => te.productoRelacionFk)
                .WithMany()
                .HasForeignKey(te => te.productoId)
                .OnDelete(DeleteBehavior.Restrict);

            // ventas  -> punto venta
            modelBuilder.Entity<Venta>()
                .HasOne(v => v.puntoVentaVentaFk)
                .WithMany()
                .HasForeignKey(v => v.puntoVentaId)
                .OnDelete(DeleteBehavior.Restrict);

            // ventas  -> usuario
            modelBuilder.Entity<Venta>()
                .HasOne(v => v.ClienteVentaFk)
                .WithMany()
                .HasForeignKey(v => v.clienteId)
                .OnDelete(DeleteBehavior.Restrict);

            // ventas  -> vendedor
            modelBuilder.Entity<Venta>()
                .HasOne(v => v.vendedorVentaFk)
                .WithMany()
                .HasForeignKey(v => v.vendedorId)
                .OnDelete(DeleteBehavior.Restrict);

            // POS -> ventas
            modelBuilder.Entity<POS>()
                .HasOne(p => p.VentaPOSFk)
                .WithMany()
                .HasForeignKey(p => p.ventaId)
                .OnDelete(DeleteBehavior.Restrict);

            // POS -> Productos
            modelBuilder.Entity<POS>()
                .HasOne(p => p.ProductoPOSFk)
                .WithMany()
                .HasForeignKey(p => p.productoId)
                .OnDelete(DeleteBehavior.Restrict);

            // proveedor -> empresa
            modelBuilder.Entity<Proveedor>()
                .HasOne(p => p.proveedorEmpresaFk)
                .WithMany()
                .HasForeignKey(p => p.empresaId)
                .OnDelete(DeleteBehavior.Restrict);

            // compra -> proveedor
            modelBuilder.Entity<Compra>()
                .HasOne(c => c.proveedorCompraFk)
                .WithMany()
                .HasForeignKey(c => c.proveedorId)
                .OnDelete(DeleteBehavior.Restrict);

            // compra -> punto venta
            modelBuilder.Entity<Compra>()
                .HasOne(c => c.puntoVentaVentaFk)
                .WithMany()
                .HasForeignKey(c => c.puntoVentaId)
                .OnDelete(DeleteBehavior.Restrict);

            // compra -> usuario
            modelBuilder.Entity<Compra>()
                .HasOne(c => c.solicitanteCompraFk)
                .WithMany()
                .HasForeignKey(c => c.solicitanteId)
                .OnDelete(DeleteBehavior.Restrict);

            // pedido -> compra 
            modelBuilder.Entity<Pedido>()
                .HasOne(p => p.pedidoCompraFk)
                .WithMany()
                .HasForeignKey(p => p.compraId)
                .OnDelete(DeleteBehavior.Restrict);

            // pedido -> producto
            modelBuilder.Entity<Pedido>()
                .HasOne(p => p.productoCompraFk)
                .WithMany()
                .HasForeignKey(p => p.productoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Categoria>(entity =>
            {
                entity.ToTable("Categoria");
                entity.HasOne(c => c.categoriapadreFk)
                      .WithMany()
                      .HasForeignKey(c => c.categoriapadreId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
