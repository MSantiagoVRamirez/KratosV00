using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Kratos.Server.Models.Seguridad;
using Kratos.Server.Models.Contexto;
namespace Kratos.Server.Controllers.Seguridad
{

    [Route("api/[controller]")]
    [ApiController]
    public class ModulosController : ControllerBase
    {
        private readonly KratosContext _context;
        public ModulosController(KratosContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Route("insertar")]
        public async Task<IActionResult> insertar(Modulo modulo)
        {
            var nombreNormalizado = modulo.nombre.Trim().ToLower();
            var moduloExistente = await _context.Modulo.AnyAsync(a => a.nombre.Trim().ToLower() == nombreNormalizado);
            if (moduloExistente)
            {
                BadRequest($"Error: {nombreNormalizado} ya se encuentra registrada.");
            }
            await _context.Modulo.AddAsync(modulo);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        [Route("leer")]
        public async Task<ActionResult<List<Modulo>>> leer()
        {
            var listaModulos = await _context.Modulo.ToListAsync();

            return Ok(listaModulos);
        }
        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar(int id)
        {
            Modulo modulo = await _context.Modulo.FindAsync(id);

            if (modulo == null)
            {
                return BadRequest($"No ha sido Encontrado el Registro con el ID: {id}");
            }
            return Ok(modulo);
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(Modulo modulo)
        {
            var moduloExistente = await _context.Modulo.FindAsync(modulo.id);
            if (moduloExistente == null)
            {
                return BadRequest("Error: el Registro que intenta editar no existe,Verifique nuevamente la informacion");
            }
            var nombreNormalizado = modulo.nombre.Trim().ToLower();
            var moduloConMismoNombre = await _context.Modulo
                .Where(a => a.id != modulo.id && a.nombre.Trim().ToLower() == nombreNormalizado)
                .FirstOrDefaultAsync();
            if (moduloConMismoNombre != null)
            {
                return BadRequest($"Error: Ya existe un modulo con el nombre {modulo.nombre}");
            }
            moduloExistente.nombre = modulo.nombre;

            try
            {
                _context.Modulo.Update(moduloExistente);
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
            var moduloBorrado = await _context.Modulo.FindAsync(Id);

            _context.Modulo.Remove(moduloBorrado);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
