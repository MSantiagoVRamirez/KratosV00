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
    public class RegimenesTributariosController : ControllerBase
    {
        private readonly KratosContext _context;
        public RegimenesTributariosController(KratosContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Route("insertar")]
        public async Task<IActionResult> insertar(RegimenTributario regimen)
        {
            //validar nombre de régimen tributario
            var nombreNormlizado = regimen.nombre.Trim().ToLower();
            var regimenExistente = await _context.RegimenTributario.AnyAsync(r => r.nombre.Trim().ToLower() == nombreNormlizado);
            if (regimenExistente)
            {
                return BadRequest($"Error: El régimen tributario '{nombreNormlizado}' ya se encuentra registrado.");
            }
            await _context.RegimenTributario.AddAsync(regimen);
            await _context.SaveChangesAsync();
            return Ok(regimen);
        }
        [HttpGet]
        [Route("leer")]
        public async Task<List<RegimenTributario>> leer()
        {
            var regimenes = await _context.RegimenTributario.ToListAsync();
            return regimenes;
        }

        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar(int id)
        {
            RegimenTributario regimen = await _context.RegimenTributario.FindAsync(id);

            if (regimen == null)
            {
                return BadRequest($"No ha sido Encontrado el Registro con el ID: {id}");
            }
            return Ok(regimen);
        }
        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(RegimenTributario regimen)
        {
            if (regimen == null || regimen.id == 0)
            {
                return BadRequest("Datos de régimen tributario inválidos");
            }
            var regimenExistente = await _context.RegimenTributario.FirstOrDefaultAsync(r => r.id == regimen.id);
            if (regimenExistente == null)
            {
                return BadRequest("Régimen tributario no encontrado");
            }
            // Validar si el nombre ya existe
            var nombreNormalizado = regimen.nombre.Trim().ToLower();
            var regimenNombreExistente = await _context.RegimenTributario
                .AnyAsync(r => r.nombre.Trim().ToLower() == nombreNormalizado && r.id != regimen.id);
            if (regimenNombreExistente)
            {
                return BadRequest($"Error: El régimen tributario '{nombreNormalizado}' ya se encuentra registrado.");
            }
            // Actualizar todos los campos
            regimenExistente.nombre = regimen.nombre;
            regimenExistente.descripcion = regimen.descripcion;
            regimenExistente.codigo = regimen.codigo;
            regimenExistente.estado = regimen.estado;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(regimenExistente);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }
        [HttpDelete]
        [Route("eliminar")]
        public async Task<IActionResult> eliminar(int id)
        {
            var regimen = await _context.RegimenTributario.FindAsync(id);
            if (regimen == null)
            {
                return BadRequest("El Regimen que desea eliminar No se encuentra en base de datos");
            }
            _context.RegimenTributario.Remove(regimen);
            await _context.SaveChangesAsync();
            return Ok();
        }    
    }
}
