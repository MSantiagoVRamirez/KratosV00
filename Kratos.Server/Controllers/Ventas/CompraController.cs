using System.ComponentModel.DataAnnotations;
using Kratos.Server.Filters;
using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Ventas;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kratos.Server.Controllers.Ventas
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompraController : ControllerBase
    {
        private readonly KratosContext _context;

        public CompraController(KratosContext context)
        {
            _context = context;
        }
        public class CrearCompraDto
        {
            [Required]
            public int puntoVentaId { get; set; }
            public int? proveedorId { get; set; }
            public int? solicitanteId { get; set; }
            public string? numeroFactura { get; set; }
            public Compra.TipoCompra tipoCompra { get; set; } = Compra.TipoCompra.Contado;
            public Compra.TipoPago tipoPago { get; set; } = Compra.TipoPago.Efectivo;
        }

        [HttpPost("crearPendiente")]
        public async Task<ActionResult<Compra>> CrearPendiente([FromBody] CrearCompraDto dto)
        {
            var compra = new Compra
            {
                puntoVentaId = dto.puntoVentaId,
                proveedorId = dto.proveedorId,
                solicitanteId = dto.solicitanteId,
                numeroFactura = dto.numeroFactura,
                tipoCompra = dto.tipoCompra,
                tipoPago = dto.tipoPago,
                fecha = DateTime.Now,
                total = 0,
                estado = Compra.EstadoCompra.Pendiente,
                activo = true,
                estaCancelada = false
            };
            _context.Compra.Add(compra);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(consultar), new { id = compra.id }, compra);
        }

        [HttpPost]
        [Route("insertar")]
        public async Task<IActionResult> insertar(Compra compra)
        {
            var numeroFactura = compra.numeroFactura.Trim().ToLower();
            var CompraExistente = await _context.Compra.AnyAsync(c => c.numeroFactura.Trim().ToLower() == numeroFactura);
            if (CompraExistente)
            {
                BadRequest($"Ya existe una factura registrada con el numero '{compra.numeroFactura}'.");
            }
            await _context.Compra.AddAsync(compra);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("leerPendientes")]
        public async Task<ActionResult<IEnumerable<Compra>>> leerPendientes(int? puntoVentaId = null)
        {
            var query = _context.Compra.AsQueryable();
            query = query.Where(c => c.estado == Compra.EstadoCompra.Pendiente && c.activo == true && c.estaCancelada == false);
            if (puntoVentaId.HasValue)
                query = query.Where(c => c.puntoVentaId == puntoVentaId.Value);
            var list = await query.OrderByDescending(c => c.fecha).ToListAsync();
            return Ok(list);
        }

        [HttpGet("leerContinuables")]
        public async Task<ActionResult<IEnumerable<object>>> leerContinuables(int? puntoVentaId = null)
        {
            var query = _context.Compra
                .Include(c => c.puntoVentaVentaFk)
                .Include(c => c.proveedorCompraFk)
                .Include(c => c.solicitanteCompraFk)
                .Where(c => c.estado == Compra.EstadoCompra.Pendiente || c.estado == Compra.EstadoCompra.Cancelada)
                .AsQueryable();

            if (puntoVentaId.HasValue)
                query = query.Where(c => c.puntoVentaId == puntoVentaId.Value);

            var compras = await query
                .OrderByDescending(c => c.fecha)
                .Select(c => new
                {
                    c.id,
                    c.fecha,
                    c.numeroFactura,
                    c.total,
                    c.tipoCompra,
                    c.tipoPago,
                    c.estado,
                    c.activo,
                    c.puntoVentaId,
                    puntoVentaNombre = c.puntoVentaVentaFk != null ? c.puntoVentaVentaFk.nombre : null,
                    c.proveedorId,
                    proveedorNombre = c.proveedorCompraFk != null ? c.proveedorCompraFk.nombre : null,
                    c.solicitanteId,
                    solicitanteNombre = c.solicitanteCompraFk != null ? (c.solicitanteCompraFk.nombres + " " + c.solicitanteCompraFk.apellidos) : null,
                })
                .ToListAsync();

            return Ok(compras);
        }

        [HttpGet]
        [Route("leer")]
        public async Task<ActionResult<IEnumerable<Compra>>> leer()
        {
            var compras = await _context.Compra.ToListAsync();

            return Ok(compras);
        }
        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar(int id)
        {
            Compra compra = await _context.Compra.FindAsync(id);

            if (compra == null)
            {
                return BadRequest($"No ha sido Encontrada la Compra con el ID: {id}");
            }
            return Ok(compra);
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(Compra compra)
        {
            var compraExistente = await _context.Compra.FindAsync(compra.id);
            if (compraExistente == null)
            {
                return BadRequest("Error: el dato que intenta editar no existe,Verifique nuevamente la informacion");
            }
            compraExistente.numeroFactura = compra.numeroFactura;
            compraExistente.fecha = compra.fecha;
            compraExistente.total = compra.total;
            compraExistente.tipoCompra = compra.tipoCompra;
            compraExistente.tipoPago = compra.tipoPago;
            compraExistente.estado = compra.estado;



            try
            {
                _context.Compra.Update(compraExistente);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {

                return StatusCode(500, "Error al actualizar el rol en la base de datos.");
            }
            return Ok();
        }
        [HttpDelete]
        [Route("eliminar")]
        public async Task<IActionResult> eliminar(int Id)
        {
            var compraBorrado = await _context.Compra.FindAsync(Id);

            _context.Compra.Remove(compraBorrado);

            await _context.SaveChangesAsync();
            return Ok();
        }

        public class FinalizarDto
        {
            [Required]
            public int compraId { get; set; }
            public string siguienteEstado { get; set; } = "Pagada"; // Pagada o PorCobrar (según enum existente)
        }

        // Variante que afecta inventario al finalizar (aumenta stock)
        [HttpPost("finalizarConInventario")]
        public async Task<IActionResult> FinalizarConInventario([FromBody] FinalizarDto dto)
        {
            var compra = await _context.Compra.FindAsync(dto.compraId);
            if (compra == null) return NotFound();

            if (compra.estado != Compra.EstadoCompra.Pendiente)
            {
                return BadRequest("Solo se puede finalizar una compra en estado Pendiente.");
            }

            // Determinar nuevo estado
            Compra.EstadoCompra nuevoEstado;
            if (string.Equals(dto.siguienteEstado, "Pagada", StringComparison.OrdinalIgnoreCase))
                nuevoEstado = Compra.EstadoCompra.Pagada;
            else if (string.Equals(dto.siguienteEstado, "PorCobrar", StringComparison.OrdinalIgnoreCase))
                nuevoEstado = Compra.EstadoCompra.PorCobrar;
            else
                return BadRequest("Estado siguiente inválido. Use 'Pagada' o 'PorCobrar'.");

            var lineas = await _context.Pedido
                .Include(p => p.productoCompraFk)
                .Where(p => p.compraId == compra.id)
                .ToListAsync();

            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var linea in lineas)
                {
                    // Servicios no afectan inventario
                    var esServicio = linea.productoCompraFk != null && linea.productoCompraFk.productoServicio;
                    if (esServicio) continue;

                    var inventario = await _context.Inventario
                        .FirstOrDefaultAsync(i => i.productoId == linea.productoId && i.puntoventaId == compra.puntoVentaId);

                    if (inventario == null)
                    {
                        // Si no existe inventario, crearlo en 0 y sumar
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
                }

                compra.estado = nuevoEstado;
                compra.activo = false;
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
            public int compraId { get; set; }
        }

        [HttpPost("cancelar")]
        public async Task<IActionResult> Cancelar([FromBody] CancelarDto dto)
        {
            var compra = await _context.Compra.FindAsync(dto.compraId);
            if (compra == null) return NotFound();

            var lineas = await _context.Pedido.Where(p => p.compraId == compra.id).ToListAsync();
            _context.Pedido.RemoveRange(lineas);

            compra.total = 0;
            compra.estado = Compra.EstadoCompra.Cancelada;
            compra.activo = false;
            compra.estaCancelada = true;

            await _context.SaveChangesAsync();
            return Ok();
        }

        public class ReabrirDto
        {
            [Required]
            public int compraId { get; set; }
        }

        [HttpPost("reabrir")]
        public async Task<IActionResult> Reabrir([FromBody] ReabrirDto dto)
        {
            var compra = await _context.Compra.FindAsync(dto.compraId);
            if (compra == null) return NotFound();

            if (compra.estado == Compra.EstadoCompra.Pendiente)
            {
                compra.activo = true;
                await _context.SaveChangesAsync();
                return Ok();
            }

            if (compra.estado != Compra.EstadoCompra.Cancelada)
            {
                return BadRequest("Solo se puede reabrir una compra Cancelada o mantener una Pendiente.");
            }

            compra.estado = Compra.EstadoCompra.Pendiente;
            compra.activo = true;
            compra.estaCancelada = false;
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
