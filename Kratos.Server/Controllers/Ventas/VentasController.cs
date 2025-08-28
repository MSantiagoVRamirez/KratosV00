using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Ventas;
using System.ComponentModel.DataAnnotations;

namespace Kratos.Server.Controllers.Ventas
{
    [Route("api/[controller]")]
    [ApiController]
    public class VentasController : ControllerBase
    {
        private readonly KratosContext _context;
        public VentasController(KratosContext context)
        {
            _context = context;
        }

        public class CrearVentaDto
        {
            [Required]
            public int puntoVentaId { get; set; }
            public int? clienteId { get; set; }
            public int? vendedorId { get; set; }
            public string? numeroFactura { get; set; }
            public Venta.TipoVenta tipoVenta { get; set; } = Venta.TipoVenta.Contado;
            public Venta.TipoPago tipoPago { get; set; } = Venta.TipoPago.Efectivo;
        }

        [HttpPost("crearPendiente")]
        public async Task<ActionResult<Venta>> CrearPendiente([FromBody] CrearVentaDto dto)
        {
            var venta = new Venta
            {
                puntoVentaId = dto.puntoVentaId,
                clienteId = dto.clienteId,
                vendedorId = dto.vendedorId,
                numeroFactura = dto.numeroFactura,
                tipoVenta = dto.tipoVenta,
                tipoPago = dto.tipoPago,
                fecha = DateTime.Now,
                total = 0,
                estado = Venta.EstadoVenta.Pendiente,
                activo = true,
                estaCancelada = false
            };

            _context.Venta.Add(venta);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Consultar), new { id = venta.id }, venta);
        }

        [HttpGet("consultar")]
        public async Task<ActionResult<Venta>> Consultar(int id)
        {
            var venta = await _context.Venta.FindAsync(id);
            if (venta == null) return NotFound();
            return venta;
        }

        [HttpGet("leerPendientes")]
        public async Task<ActionResult<IEnumerable<Venta>>> LeerPendientes(int? puntoVentaId = null)
        {
            var query = _context.Venta.AsQueryable();
            query = query.Where(v => v.estado == Venta.EstadoVenta.Pendiente && v.activo == true && v.estaCancelada == false);
            if (puntoVentaId.HasValue)
                query = query.Where(v => v.puntoVentaId == puntoVentaId.Value);
            var list = await query.OrderByDescending(v => v.fecha).ToListAsync();
            return Ok(list);
        }

        // Ventas continuables: Pendientes o Canceladas
        [HttpGet("leerContinuables")]
        public async Task<ActionResult<IEnumerable<object>>> LeerContinuables(int? puntoVentaId = null)
        {
            var query = _context.Venta
                .Include(v => v.puntoVentaVentaFk)
                .Include(v => v.ClienteVentaFk)
                .Include(v => v.vendedorVentaFk)
                .Where(v => v.estado == Venta.EstadoVenta.Pendiente || v.estado == Venta.EstadoVenta.Cancelada)
                .AsQueryable();

            if (puntoVentaId.HasValue)
                query = query.Where(v => v.puntoVentaId == puntoVentaId.Value);

            var ventas = await query
                .OrderByDescending(v => v.fecha)
                .Select(v => new
                {
                    v.id,
                    v.fecha,
                    v.numeroFactura,
                    v.total,
                    v.tipoVenta,
                    v.tipoPago,
                    v.estado,
                    v.activo,
                    v.puntoVentaId,
                    puntoVentaNombre = v.puntoVentaVentaFk != null ? v.puntoVentaVentaFk.nombre : null,
                    v.clienteId,
                    clienteNombre = v.ClienteVentaFk != null ? (v.ClienteVentaFk.nombres + " " + v.ClienteVentaFk.apellidos) : null,
                    v.vendedorId,
                    vendedorNombre = v.vendedorVentaFk != null ? (v.vendedorVentaFk.nombres + " " + v.vendedorVentaFk.apellidos) : null,
                })
                .ToListAsync();

            return Ok(ventas);
        }

        // Lista general de ventas (todas), con datos relacionados básicos
        [HttpGet("leer")]
        public async Task<ActionResult<IEnumerable<object>>> Leer()
        {
            var ventas = await _context.Venta
                .Include(v => v.puntoVentaVentaFk)
                .Include(v => v.ClienteVentaFk)
                .Include(v => v.vendedorVentaFk)
                .OrderByDescending(v => v.fecha)
                .Select(v => new
                {
                    v.id,
                    v.fecha,
                    v.numeroFactura,
                    v.total,
                    v.tipoVenta,
                    v.tipoPago,
                    v.estado,
                    v.activo,
                    v.puntoVentaId,
                    puntoVentaNombre = v.puntoVentaVentaFk != null ? v.puntoVentaVentaFk.nombre : null,
                    v.clienteId,
                    clienteNombre = v.ClienteVentaFk != null ? (v.ClienteVentaFk.nombres + " " + v.ClienteVentaFk.apellidos) : null,
                    v.vendedorId,
                    vendedorNombre = v.vendedorVentaFk != null ? (v.vendedorVentaFk.nombres + " " + v.vendedorVentaFk.apellidos) : null,
                })
                .ToListAsync();

            return Ok(ventas);
        }

        public class FinalizarDto
        {
            [Required]
            public int ventaId { get; set; }
            [Required]
            public string siguienteEstado { get; set; } = "Pagada"; // "Pagada" o "PorCobrar"
        }

        [HttpPost("finalizar")]
        public async Task<IActionResult> Finalizar([FromBody] FinalizarDto dto)
        {
            var venta = await _context.Venta.FindAsync(dto.ventaId);
            if (venta == null) return NotFound();

            if (venta.estado != Venta.EstadoVenta.Pendiente)
            {
                return BadRequest("Solo se puede finalizar una venta en estado Pendiente.");
            }

            if (string.Equals(dto.siguienteEstado, "Pagada", StringComparison.OrdinalIgnoreCase))
                venta.estado = Venta.EstadoVenta.Pagada;
            else if (string.Equals(dto.siguienteEstado, "PorCobrar", StringComparison.OrdinalIgnoreCase))
                venta.estado = Venta.EstadoVenta.PorCobrar;
            else
                return BadRequest("Estado siguiente inválido. Use 'Pagada' o 'PorCobrar'.");

            venta.activo = false;
            await _context.SaveChangesAsync();
            return Ok();
        }

        // Variante que afecta inventario al finalizar
        [HttpPost("finalizarConInventario")]
        public async Task<IActionResult> FinalizarConInventario([FromBody] FinalizarDto dto)
        {
            var venta = await _context.Venta.FindAsync(dto.ventaId);
            if (venta == null) return NotFound();

            if (venta.estado != Venta.EstadoVenta.Pendiente)
            {
                return BadRequest("Solo se puede finalizar una venta en estado Pendiente.");
            }

            // Determinar nuevo estado
            Venta.EstadoVenta nuevoEstado;
            if (string.Equals(dto.siguienteEstado, "Pagada", StringComparison.OrdinalIgnoreCase))
                nuevoEstado = Venta.EstadoVenta.Pagada;
            else if (string.Equals(dto.siguienteEstado, "PorCobrar", StringComparison.OrdinalIgnoreCase))
                nuevoEstado = Venta.EstadoVenta.PorCobrar;
            else
                return BadRequest("Estado siguiente inválido. Use 'Pagada' o 'PorCobrar'.");

            var lineas = await _context.POS
                .Include(p => p.ProductoPOSFk)
                .Where(p => p.ventaId == venta.id)
                .ToListAsync();

            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var linea in lineas)
                {
                    // Servicios no afectan inventario
                    var esServicio = linea.ProductoPOSFk != null && linea.ProductoPOSFk.productoServicio;
                    if (esServicio) continue;

                    var inventario = await _context.Inventario
                        .FirstOrDefaultAsync(i => i.productoId == linea.productoId && i.puntoventaId == venta.puntoVentaId);
                    if (inventario == null)
                    {
                        await tx.RollbackAsync();
                        return BadRequest($"No hay inventario para el producto ID {linea.productoId} en el punto de venta {venta.puntoVentaId}.");
                    }
                    if (inventario.cantidad < linea.cantidad)
                    {
                        await tx.RollbackAsync();
                        return BadRequest($"Stock insuficiente para el producto ID {linea.productoId} en el punto de venta {venta.puntoVentaId}. Disponible: {inventario.cantidad}, Requerido: {linea.cantidad}.");
                    }
                    inventario.cantidad -= linea.cantidad;
                    inventario.actualizadoEn = DateTime.Now;
                    _context.Inventario.Update(inventario);
                }

                venta.estado = nuevoEstado;
                venta.activo = false;
                await _context.SaveChangesAsync();
                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }

            return Ok();
        }

        public class CancelarDto
        {
            [Required]
            public int ventaId { get; set; }
        }

        [HttpPost("cancelar")]
        public async Task<IActionResult> Cancelar([FromBody] CancelarDto dto)
        {
            var venta = await _context.Venta.FindAsync(dto.ventaId);
            if (venta == null) return NotFound();

            // Eliminar POS asociados
            var lineas = await _context.POS.Where(p => p.ventaId == venta.id).ToListAsync();
            _context.POS.RemoveRange(lineas);

            venta.total = 0;
            venta.estado = Venta.EstadoVenta.Cancelada;
            venta.activo = false;
            venta.estaCancelada = true;

            await _context.SaveChangesAsync();
            return Ok();
        }

        public class ReabrirDto
        {
            [Required]
            public int ventaId { get; set; }
        }

        // Reabrir una venta (Cancelada -> Pendiente) para continuar en POS
        [HttpPost("reabrir")]
        public async Task<IActionResult> Reabrir([FromBody] ReabrirDto dto)
        {
            var venta = await _context.Venta.FindAsync(dto.ventaId);
            if (venta == null) return NotFound();

            if (venta.estado == Venta.EstadoVenta.Pendiente)
            {
                venta.activo = true;
                await _context.SaveChangesAsync();
                return Ok();
            }

            if (venta.estado != Venta.EstadoVenta.Cancelada)
            {
                return BadRequest("Solo se puede reabrir una venta Cancelada o mantener una Pendiente.");
            }

            venta.estado = Venta.EstadoVenta.Pendiente;
            venta.activo = true;
            venta.estaCancelada = false;
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
