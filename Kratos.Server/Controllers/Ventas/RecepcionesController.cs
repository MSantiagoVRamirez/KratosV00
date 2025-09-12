using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Seguridad;
using Kratos.Server.Models.Ventas;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Kratos.Server.Controllers.Ventas
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecepcionesController : ControllerBase
    {
        private readonly KratosContext _context;
        public RecepcionesController(KratosContext context)
        {
            _context = context;
        }

        // Lista compras pendientes para seleccionar en la recepción
        [HttpGet("ordenesPendientes")]
        public async Task<ActionResult<IEnumerable<object>>> OrdenesPendientes(int? puntoVentaId = null)
        {
            var query = _context.Compra
                .Include(c => c.puntoVentaVentaFk)
                .Include(c => c.proveedorCompraFk)
                .Include(c => c.solicitanteCompraFk)
                .Where(c =>  c.estaCancelada == false && c.recibido == false)
                .AsQueryable();

            if (puntoVentaId.HasValue)
                query = query.Where(c => c.puntoVentaId == puntoVentaId.Value);

            var list = await query
                .OrderByDescending(c => c.fecha)
                .Select(c => new
                {
                    c.id,
                    c.fecha,
                    c.numeroFactura,
                    c.total,
                    c.puntoVentaId,
                    puntoVentaNombre = c.puntoVentaVentaFk != null ? c.puntoVentaVentaFk.nombre : null,
                    c.proveedorId,
                    proveedorNombre = c.proveedorCompraFk != null ? c.proveedorCompraFk.nombre : null,
                    c.solicitanteId,
                    solicitanteNombre = c.solicitanteCompraFk != null ? (c.solicitanteCompraFk.nombres + " " + c.solicitanteCompraFk.apellidos) : null,
                })
                .ToListAsync();

            return Ok(list);
        }

        // Usuarios de la misma empresa asociada a la compra (por PuntoVenta.empresaId -> Empresa.token)
        [HttpGet("usuariosPorCompra")]
        public async Task<ActionResult<IEnumerable<object>>> UsuariosPorCompra(int compraId)
        {
            var compra = await _context.Compra.Include(c => c.puntoVentaVentaFk).FirstOrDefaultAsync(c => c.id == compraId);
            if (compra == null) return NotFound("Compra no encontrada");

            var pv = compra.puntoVentaVentaFk != null
                ? compra.puntoVentaVentaFk
                : await _context.PuntoVenta.FindAsync(compra.puntoVentaId);
            if (pv == null || !pv.empresaId.HasValue) return Ok(Array.Empty<object>());

            var empresa = await _context.Empresa.FindAsync(pv.empresaId.Value);
            if (empresa == null || string.IsNullOrEmpty(empresa.token)) return Ok(Array.Empty<object>());

            var usuarios = await _context.Usuario
                .Where(u => u.token == empresa.token)
                .Select(u => new
                {
                    u.id,
                    u.email,
                    u.nombres,
                    u.apellidos
                })
                .ToListAsync();

            return Ok(usuarios);
        }

        public class AplicarRecepcionDto
        {
            [Required]
            public int compraId { get; set; }
            public DateTime? fechaHora { get; set; }
            public string? entregadoPor { get; set; }
            public int? usuarioId { get; set; }
            public List<DetalleRecepcionDto> detalles { get; set; } = new();
        }

        public class DetalleRecepcionDto
        {
            [Required]
            public int pedidoId { get; set; }
            public bool completo { get; set; }
        }

        // Aplica recepción: suma al inventario solo líneas marcadas como completas
        [HttpPost("aplicar")]
        public async Task<IActionResult> Aplicar([FromBody] AplicarRecepcionDto dto)
        {
            var compra = await _context.Compra.FindAsync(dto.compraId);
            if (compra == null) return NotFound("Compra no encontrada");
            if (compra.estado != Compra.EstadoCompra.Pendiente)
                return BadRequest("Solo se puede recepcionar una compra en estado Pendiente.");

            var pedidos = await _context.Pedido
                .Include(p => p.productoCompraFk)
                .Where(p => p.compraId == dto.compraId)
                .ToListAsync();

            var completarIds = dto.detalles.Where(d => d.completo).Select(d => d.pedidoId).ToHashSet();

            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                // Crear cabecera de recepción
                var recepcion = new Recepcion
                {
                    compraId = compra.id,
                    fechaHora = dto.fechaHora ?? DateTime.Now,
                    entregadoPor = dto.entregadoPor,
                    usuarioId = dto.usuarioId,
                    creadoEn = DateTime.Now
                };
                await _context.Recepcion.AddAsync(recepcion);
                await _context.SaveChangesAsync();

                foreach (var linea in pedidos)
                {
                    if (!completarIds.Contains(linea.id)) continue; // solo completas

                    // Si el producto es servicio, no afecta inventario
                    var esServicio = linea.productoCompraFk != null && linea.productoCompraFk.productoServicio;
                    if (esServicio) continue;

                    var inventario = await _context.Inventario
                        .FirstOrDefaultAsync(i => i.productoId == linea.productoId && i.puntoventaId == compra.puntoVentaId);
                    if (inventario == null)
                    {
                        inventario = new Inventario
                        {
                            productoId = linea.productoId,
                            puntoventaId = compra.puntoVentaId,
                            cantidad = 0,
                            productoServicio = false,
                            creadoEn = DateTime.Now,
                            actualizadoEn = DateTime.Now
                        };
                        await _context.Inventario.AddAsync(inventario);
                    }
                    inventario.cantidad += linea.cantidad;
                    inventario.actualizadoEn = DateTime.Now;
                    _context.Inventario.Update(inventario);

                    // Crear detalle de recepción marcado como completo
                    var det = new RecepcionDetalle
                    {
                        recepcionId = recepcion.id,
                        pedidoId = linea.id,
                        completo = true
                    };
                    await _context.RecepcionDetalle.AddAsync(det);
                }

                // Si todas las líneas de la compra vienen marcadas como completas, opcionalmente cerramos la compra
                var todasIds = pedidos.Select(p => p.id).ToHashSet();
                if (todasIds.Count > 0 && todasIds.All(id => completarIds.Contains(id)))
                {
                    compra.estado = Compra.EstadoCompra.Finalizada;
                    compra.activo = false;
                }
                // Marcar compra como recepcionada
                compra.recibido = true;

                await _context.SaveChangesAsync();
                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }

            // Por ahora no persistimos cabecera/metadata de recepción (primera versión)
            return Ok();
        }
    }
}

