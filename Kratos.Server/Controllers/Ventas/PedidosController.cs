using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Ventas;

namespace Kratos.Server.Controllers.Ventas
{
    [Route("api/[controller]")]
    [ApiController]
    public class PedidosController : ControllerBase
    {
        private readonly KratosContext _context;
        public PedidosController(KratosContext context)
        {
            _context = context;
        }

        private static decimal CalcularSubtotal(Pedido item)
        {
            var baseTotal = item.precioUnitario * item.cantidad;
            var descuento = baseTotal * (item.porcentajeDescuento / 100m);
            var baseConDescuento = baseTotal - descuento;
            var impuesto = baseConDescuento * (item.porcentajeInpuesto / 100m);
            return baseConDescuento + impuesto;
        }

        private async Task ActualizarTotalCompra(int compraId)
        {
            var total = await _context.Pedido.Where(p => p.compraId == compraId).SumAsync(p => (decimal?)p.subTotal) ?? 0m;
            var compra = await _context.Compra.FindAsync(compraId);
            if (compra != null)
            {
                compra.total = total;
                await _context.SaveChangesAsync();
            }
        }

        [HttpGet("leerPorCompra")]
        public async Task<ActionResult<IEnumerable<object>>> LeerPorCompra(int compraId)
        {
            var lineas = await _context.Pedido
                .Include(p => p.productoCompraFk)
                .Where(p => p.compraId == compraId)
                .Select(p => new
                {
                    p.id,
                    p.compraId,
                    p.productoId,
                    productoNombre = p.productoCompraFk != null ? p.productoCompraFk.nombre : null,
                    productoCodigo = p.productoCompraFk != null ? p.productoCompraFk.codigo : null,
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
        public async Task<IActionResult> Insertar([FromBody] Pedido item)
        {
            var compra = await _context.Compra.FindAsync(item.compraId);
            if (compra == null) return BadRequest($"Compra no encontrada (ID: {item.compraId})");
            if (compra.estado != Compra.EstadoCompra.Pendiente)
                return BadRequest("No se pueden agregar líneas a una compra no Pendiente.");

            item.subTotal = CalcularSubtotal(item);
            await _context.Pedido.AddAsync(item);
            await _context.SaveChangesAsync();
            await ActualizarTotalCompra(item.compraId);
            return Ok();
        }

        [HttpPut("editar")]
        public async Task<IActionResult> Editar([FromBody] Pedido item)
        {
            var existente = await _context.Pedido.FindAsync(item.id);
            if (existente == null) return NotFound();
            var compra = await _context.Compra.FindAsync(existente.compraId);
            if (compra == null) return BadRequest("Compra no encontrada");
            if (compra.estado != Compra.EstadoCompra.Pendiente)
                return BadRequest("No se pueden editar líneas de una compra no Pendiente.");

            existente.productoId = item.productoId;
            existente.precioUnitario = item.precioUnitario;
            existente.cantidad = item.cantidad;
            existente.porcentajeInpuesto = item.porcentajeInpuesto;
            existente.porcentajeDescuento = item.porcentajeDescuento;
            existente.subTotal = CalcularSubtotal(existente);
            _context.Pedido.Update(existente);
            await _context.SaveChangesAsync();
            await ActualizarTotalCompra(existente.compraId);
            return Ok();
        }

        [HttpDelete("eliminar")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var item = await _context.Pedido.FindAsync(id);
            if (item == null) return NotFound();
            var compraId = item.compraId;
            _context.Pedido.Remove(item);
            await _context.SaveChangesAsync();
            await ActualizarTotalCompra(compraId);
            return Ok();
        }
    }
}
