using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kratos.Server.Models.Seguridad;
using Kratos.Server.Models.Contexto;

namespace Kratos.Server.Controllers.Seguridad
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly KratosContext _context;

        public RolesController(KratosContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Route("insertar")]
        public async Task<IActionResult> insertar(Rol rol)
        {
            var nombreNormalizado = rol.nombre.Trim().ToLower();
            var rolExistente = await _context.Rol.AnyAsync(a => a.nombre.Trim().ToLower() == nombreNormalizado);
            if (rolExistente)
            {
                BadRequest($"Error: {nombreNormalizado} ya se encuentra registrada.");
            }
            await _context.Rol.AddAsync(rol);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        [Route("leer")]
        public async Task<ActionResult<List<Rol>>> leer()
        {
            var listaRoles = await _context.Rol.ToListAsync();

            return Ok(listaRoles);
        }
        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar(int id)
        {
            Rol rol = await _context.Rol.FindAsync(id);

            if (rol == null)
            {
                return BadRequest($"No ha sido Encontrado el Registro con el ID: {id}");
            }
            return Ok(rol);
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(Rol rol)
        {
            var rolExistente = await _context.Rol.FindAsync(rol.id);
            if (rolExistente == null)
            {
                return BadRequest("Error: el Registro que intenta editar no existe,Verifique nuevamente la informacion");
            }
            //validar si el nombre ya existe
            var nombreNormalizado = rol.nombre.Trim().ToLower();
            var rolNombreExistente = await _context.Rol
                .AnyAsync(a => a.nombre.Trim().ToLower() == nombreNormalizado && a.id != rol.id);
            if (rolNombreExistente)
            {
                return BadRequest($"Error: {nombreNormalizado} ya se encuentra registrada.");
            }
            rolExistente.nombre = rol.nombre;
            rolExistente.descripcion = rol.descripcion;
            rolExistente.empresaId = rol.empresaId;
            try
            {
                _context.Rol.Update(rolExistente);
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
            var rolBorrado = await _context.Rol.FindAsync(Id);
            _context.Rol.Remove(rolBorrado);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}