using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Kratos.Server.Models.Ventas;
using Kratos.Server.Models.Contexto;

namespace Kratos.Server.Controllers.Ventas
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class InventariosController : ControllerBase
    {
        private readonly KratosContext _context;
        public InventariosController(KratosContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Route("insertar")]
        public async Task<IActionResult> insertar(Inventario inventario)
        {

            var inventarioExistente = await _context.Inventario.AnyAsync(i => i.productoId == inventario.productoId);
            if (inventarioExistente)
            {
                return BadRequest($"Error: Ya existe un Registro con ese Producto asociado.");
            }
            await _context.Inventario.AddAsync(inventario);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        [Route("leer")]
        public async Task<ActionResult<IEnumerable<object>>> leer()
        {
            var inventario = await _context.Inventario
                .Include(i => i.productoFk)
                .Include(i => i.puntoventaFk)
                .Select(i => new
                {
                    i.id,
                    i.productoId,
                    productoNombre = i.productoFk != null ? i.productoFk.nombre : null,
                    productoCodigo = i.productoFk != null ? i.productoFk.codigo : null,
                    i.puntoventaId,
                    puntoventaNombre = i.puntoventaFk != null ? i.puntoventaFk.nombre : null,
                    i.cantidad,
                    i.productoServicio,
                    i.creadoEn,
                    i.actualizadoEn
                })
                .ToListAsync();

            return Ok(inventario);
        }
        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar(int id)
        {
            Inventario inventario = await _context.Inventario.FindAsync(id);

            if (inventario == null)
            {
                return BadRequest($"No ha sido Encontrado el Registro con el ID: {id}");
            }
            return Ok(inventario);
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(Inventario inventario)
        {
            var inventarioExistente = await _context.Inventario.FindAsync(inventario.id);
            if (inventarioExistente == null)
            {
                return BadRequest("Error: el Registro que intenta editar no existe,Verifique nuevamente la informacion");
            }
            inventarioExistente.productoId = inventario.productoId;
            inventarioExistente.puntoventaId = inventario.puntoventaId;
            inventarioExistente.cantidad = inventario.cantidad;
            inventarioExistente.productoServicio = inventario.productoServicio;
            inventarioExistente.creadoEn = inventario.creadoEn;
            inventarioExistente.actualizadoEn = DateTime.Now;

            try
            {
                _context.Inventario.Update(inventarioExistente);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {

                return StatusCode(500, "Error al actualizar el Impuesto en la base de datos.");
            }
            return Ok();
        }
        [HttpDelete]
        [Route("eliminar")]
        public async Task<IActionResult> eliminar(int Id)
        {
            var inventarioBorrado = await _context.Inventario.FindAsync(Id);
            if (inventarioBorrado == null)
            {
                return NotFound();
            }

            _context.Inventario.Remove(inventarioBorrado);

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
