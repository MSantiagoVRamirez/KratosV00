using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Ventas;
using System.ComponentModel.DataAnnotations;

namespace Kratos.Server.Controllers.Ventas
{
    [Route("api/[controller]")]
    [ApiController]
    public class POSController : ControllerBase
    {
        private readonly KratosContext _context;
        public POSController(KratosContext context)
        {
            _context = context;
        }

        private static decimal CalcularSubtotal(POS item)
        {
            var baseTotal = item.precioUnitario * item.cantidad;
            var descuento = baseTotal * (item.porcentajeDescuento / 100m);
            var baseConDescuento = baseTotal - descuento;
            var impuesto = baseConDescuento * (item.porcentajeInpuesto / 100m);
            return baseConDescuento + impuesto;
        }

        private async Task ActualizarTotalVenta(int ventaId)
        {
            var total = await _context.POS.Where(p => p.ventaId == ventaId).SumAsync(p => (decimal?)p.subTotal) ?? 0m;
            var venta = await _context.Venta.FindAsync(ventaId);
            if (venta != null)
            {
                venta.total = total;
                await _context.SaveChangesAsync();
            }
        }

        [HttpGet("leerPorVenta")]
        public async Task<ActionResult<IEnumerable<object>>> LeerPorVenta(int ventaId)
        {
            var lineas = await _context.POS
                .Include(p => p.ProductoPOSFk)
                .Where(p => p.ventaId == ventaId)
                .Select(p => new
                {
                    p.id,
                    p.ventaId,
                    p.productoId,
                    productoNombre = p.ProductoPOSFk != null ? p.ProductoPOSFk.nombre : null,
                    productoCodigo = p.ProductoPOSFk != null ? p.ProductoPOSFk.codigo : null,
                    p.precioUnitario,
                    p.cantidad,
                    p.porcentajeInpuesto,
                    p.porcentajeDescuento,
                    p.subTotal
                })
                .ToListAsync();
            return Ok(lineas);
        }

        [HttpPost("insertar")]
        public async Task<IActionResult> Insertar([FromBody] POS item)
        {
            var venta = await _context.Venta.FindAsync(item.ventaId);
            if (venta == null) return BadRequest("Venta no encontrada");
            if (venta.estado != Venta.EstadoVenta.Pendiente)
                return BadRequest("No se pueden agregar líneas a una venta no Pendiente.");

            item.subTotal = CalcularSubtotal(item);
            await _context.POS.AddAsync(item);
            await _context.SaveChangesAsync();
            await ActualizarTotalVenta(item.ventaId);
            return Ok();
        }

        [HttpPut("editar")]
        public async Task<IActionResult> Editar([FromBody] POS item)
        {
            var existente = await _context.POS.FindAsync(item.id);
            if (existente == null) return NotFound();
            var venta = await _context.Venta.FindAsync(existente.ventaId);
            if (venta == null) return BadRequest("Venta no encontrada");
            if (venta.estado != Venta.EstadoVenta.Pendiente)
                return BadRequest("No se pueden editar líneas de una venta no Pendiente.");

            existente.productoId = item.productoId;
            existente.precioUnitario = item.precioUnitario;
            existente.cantidad = item.cantidad;
            existente.porcentajeInpuesto = item.porcentajeInpuesto;
            existente.porcentajeDescuento = item.porcentajeDescuento;
            existente.subTotal = CalcularSubtotal(existente);
            _context.POS.Update(existente);
            await _context.SaveChangesAsync();
            await ActualizarTotalVenta(existente.ventaId);
            return Ok();
        }

        [HttpDelete("eliminar")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var item = await _context.POS.FindAsync(id);
            if (item == null) return NotFound();
            var ventaId = item.ventaId;
            _context.POS.Remove(item);
            await _context.SaveChangesAsync();
            await ActualizarTotalVenta(ventaId);
            return Ok();
        }

        [HttpGet("topProductos")]
        public async Task<ActionResult<IEnumerable<object>>> TopProductos(int limit = 8)
        {
            // Agrupa lneas POS por producto, considerando ventas Finalizadas o Pagadas
            var query = from p in _context.POS
                        join v in _context.Venta on p.ventaId equals v.id
                        join prod in _context.Producto on p.productoId equals prod.id
                        where v.estado == Venta.EstadoVenta.Finalizada || v.estado == Venta.EstadoVenta.Pagada
                        group new { p, prod } by new { p.productoId, prod.nombre, prod.codigo, prod.ImagenUrl } into g
                        orderby g.Sum(x => (int?)x.p.cantidad) ?? 0 descending
                        select new
                        {
                            productoId = g.Key.productoId,
                            nombre = g.Key.nombre,
                            codigo = g.Key.codigo,
                            imagenUrl = g.Key.ImagenUrl,
                            totalCantidad = g.Sum(x => (int?)x.p.cantidad) ?? 0,
                            totalVentas = g.Sum(x => (decimal?)x.p.subTotal) ?? 0m
                        };

            var list = await query.Take(Math.Max(1, limit)).ToListAsync();
            return Ok(list);
        }
    }
}
