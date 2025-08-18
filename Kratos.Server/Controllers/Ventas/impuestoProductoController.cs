using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Ventas;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kratos.Server.Controllers.Ventas
{
    [Route("api/[controller]")]
    [ApiController]
    public class impuestoProductoController : ControllerBase
    {
        private readonly KratosContext _context;

        public impuestoProductoController(KratosContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Route("insertar")]

        public async Task<IActionResult> insertar(impuestoProducto  relacion)
        {          
            var ralacionExistente = await _context.impuestoProducto.AnyAsync(r => r.impuestoId == relacion.impuestoId && r.productoId == relacion.productoId);
            if (ralacionExistente)
            {
                BadRequest($"Error {relacion} ya se encuentra registrada.");
            }
            await _context.impuestoProducto.AddAsync(relacion);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        [Route("leer")]
        public async Task<ActionResult<IEnumerable<impuestoProducto>>> leer()
        {
            var relaciones = await _context.impuestoProducto.ToListAsync();

            return Ok(relaciones);
        }
        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar(int id)
        {
            impuestoProducto relacion = await _context.impuestoProducto.FindAsync(id);

            if (relacion == null)
            {
                return BadRequest($"No ha sido Encontrada la Relacion con el ID: {id}");
            }
            return Ok(relacion);
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(impuestoProducto relacion)
        {
            var relacionExistente = await _context.impuestoProducto.FindAsync(relacion.id);
            if (relacionExistente == null)
            {
                return BadRequest("Error: el Registro que intenta editar no existe,Verifique nuevamente la informacion");
            }
            relacionExistente.productoId = relacion.productoId;
            relacionExistente.impuestoId = relacion.impuestoId;
            try
            {
                _context.impuestoProducto.Update(relacionExistente);
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
            var relacionBorrado = await _context.impuestoProducto.FindAsync(Id);

            _context.impuestoProducto.Remove(relacionBorrado);

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
