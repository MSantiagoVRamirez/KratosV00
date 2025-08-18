using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Kratos.Server.Models.Ventas;
using Kratos.Server.Models.Contexto;

namespace Kratos.Server.Controllers.Ventas
{
   
    [Route("api/[controller]")]
    [ApiController]
    public class ImpuestosController : ControllerBase
    {
        private readonly KratosContext _context;
        public ImpuestosController(KratosContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Route("insertar")]
        public async Task<IActionResult> insertar(Impuesto impuesto)
        {
            var nombreImpuesto = impuesto.nombre.Trim().ToLower();
            var ImpuestoExistente = await _context.Impuesto.AnyAsync(i => i.nombre.Trim().ToLower() == nombreImpuesto);
            if (ImpuestoExistente)
            {
                BadRequest($"Ya existe un Impuesto registrada con el nombre '{impuesto.nombre}'.");
            }
            await _context.Impuesto.AddAsync(impuesto);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        [Route("leer")]
        public async Task<ActionResult<IEnumerable<Impuesto>>> leer()
        {
            var impuestos = await _context.Impuesto.ToListAsync();

            return Ok(impuestos);
        }
        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar(int id)
        {
            Impuesto impuesto = await _context.Impuesto.FindAsync(id);

            if (impuesto == null)
            {
                return BadRequest($"No ha sido Encontrado el Impuesto con el ID: {id}");
            }
            return Ok(impuesto);
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(Impuesto impuesto)
        {
            var impuestoExistente = await _context.Impuesto.FindAsync(impuesto.id);
            if (impuestoExistente == null)
            {
                return BadRequest("Error: el Registro que intenta editar no existe,Verifique nuevamente la informacion");
            }
            impuestoExistente.tratamientoId = impuesto.tratamientoId;
            impuestoExistente.nombre = impuesto.nombre;
            impuestoExistente.descripcion = impuesto.descripcion;
            impuestoExistente.codigo = impuesto.codigo;
            impuestoExistente.porcentaje = impuesto.porcentaje;

            try
            {
                _context.Impuesto.Update(impuestoExistente);
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
            var impuestoBorrado = await _context.Impuesto.FindAsync(Id);

            _context.Impuesto.Remove(impuestoBorrado);

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
