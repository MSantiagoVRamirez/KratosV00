using Kratos.Server.Filters;
using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Seguridad;
using Kratos.Server.Models.Ventas;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kratos.Server.Controllers.Seguridad
{
    [Route("api/[controller]")]
    [ApiController]
    [ServiceFilter(typeof(PermisoAuthorizationFilter))]
    public class ActividadEconomicaController : ControllerBase
    {
        private readonly KratosContext _context;

        public ActividadEconomicaController(KratosContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Route("insertar")]
        public async Task<IActionResult> insertar(ActividadEconomica actividad)
        {
            var nombreNormalizado = actividad.nombre.Trim().ToLower();
            var actividadExistente = await _context.ActividadEconomica.AnyAsync(a => a.nombre.Trim().ToLower() == nombreNormalizado);
            if (actividadExistente)
            {
                BadRequest($"Error: {nombreNormalizado} ya se encuentra registrada.");
            }
            await _context.ActividadEconomica.AddAsync(actividad);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        [Route("leer")]
        public async Task<ActionResult<List<ActividadEconomica>>> leer()
        {
            var listaActividades = await _context.ActividadEconomica.ToListAsync();

            return Ok(listaActividades);
        }
        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar(int id)
        {
            ActividadEconomica actividad = await _context.ActividadEconomica.FindAsync(id);

            if (actividad == null)
            {
                return BadRequest($"No ha sido Encontrado el Registro con el ID: {id}");
            }
            return Ok(actividad);
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(ActividadEconomica actividad)
        {
            var actividadExistente = await _context.ActividadEconomica.FindAsync(actividad.id);
            if (actividadExistente == null)
            {
                return BadRequest("Error: el Registro que intenta editar no existe,Verifique nuevamente la informacion");
            }
            //validar si el nombre ya existe
            var nombreNormalizado = actividad.nombre.Trim().ToLower();
            var actividadNombreExistente = await _context.ActividadEconomica
                .AnyAsync(a => a.nombre.Trim().ToLower() == nombreNormalizado && a.id != actividad.id);
            if (actividadNombreExistente)
            {
                return BadRequest($"Error: {nombreNormalizado} ya se encuentra registrada.");
            }
            actividadExistente.codigoCiiu = actividad.codigoCiiu;
            actividadExistente.nombre = actividad.nombre;
            actividadExistente.descripcion = actividad.descripcion;
            actividadExistente.categoria = actividad.categoria;
            try
            {
                _context.ActividadEconomica.Update(actividadExistente);
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
            var actividadBorrado = await _context.ActividadEconomica.FindAsync(Id);

            _context.ActividadEconomica.Remove(actividadBorrado);

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
