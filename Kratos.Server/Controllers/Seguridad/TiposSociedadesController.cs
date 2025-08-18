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
    public class TiposSociedadesController : ControllerBase
    {
        private readonly KratosContext _context;
        public TiposSociedadesController(KratosContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Route("insertar")]
        public async Task<IActionResult> insertar(TipoSociedad tipoSociedad)
        {
            var nombreNormalizado = tipoSociedad.nombre.Trim().ToLower();
            var tipoSociedadExistente = await _context.TipoSociedad.AnyAsync(a => a.nombre.Trim().ToLower() == nombreNormalizado);
            if (tipoSociedadExistente)
            {
                BadRequest($"Error: {nombreNormalizado} ya se encuentra registrada.");
            }
            await _context.TipoSociedad.AddAsync(tipoSociedad);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        [Route("leer")]
        public async Task<ActionResult<List<TipoSociedad>>> leer()
        {
            var listaSociedades = await _context.TipoSociedad.ToListAsync();

            return Ok(listaSociedades);
        }
        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar(int id)
        {
            TipoSociedad tipoSociedad = await _context.TipoSociedad.FindAsync(id);

            if (tipoSociedad == null)
            {
                return BadRequest($"No ha sido Encontrado el Registro con el ID: {id}");
            }
            return Ok(tipoSociedad);
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(TipoSociedad sociedad)
        {
            var tipoSociedadExistente = await _context.TipoSociedad.FindAsync(sociedad.Id);
            if (tipoSociedadExistente == null)
            {
                return BadRequest("Error: el Registro que intenta editar no existe,Verifique nuevamente la informacion");
            }
            //validar si el nombre ya existe
            var nombreNormalizado = sociedad.nombre.Trim().ToLower();
            var sociedadNombreExistente = await _context.Rol
                .AnyAsync(a => a.nombre.Trim().ToLower() == nombreNormalizado && a.id != sociedad.Id);
            if (sociedadNombreExistente)
            {
                return BadRequest($"Error: {nombreNormalizado} ya se encuentra registrada.");
            }
            tipoSociedadExistente.nombre = sociedad.nombre;
            tipoSociedadExistente.descripcion = sociedad.descripcion;
            tipoSociedadExistente.codigo = sociedad.codigo;
            try
            {
                _context.TipoSociedad.Update(tipoSociedadExistente);
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
            var sociedadBorrado = await _context.TipoSociedad.FindAsync(Id);
            _context.TipoSociedad.Remove(sociedadBorrado);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
