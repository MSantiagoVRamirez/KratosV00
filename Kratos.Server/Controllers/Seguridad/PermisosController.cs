using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kratos.Server.Models.Seguridad;
using Kratos.Server.Models.Contexto;

namespace Kratos.Server.Controllers.Seguridad
{
    [Route("api/[controller]")]
    [ApiController]
    public class PermisosController : ControllerBase
    {
        private readonly KratosContext _context;

        public PermisosController(KratosContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Route("insertar")]
        public async Task<IActionResult> insertar(Permiso permisos)
        {
            // Validar la relacion entre el rol y el modulo
            var permisoExistente = await _context.Permiso.Where(p => p.rolesId == permisos.rolesId && p.modulosId == permisos.modulosId).FirstOrDefaultAsync();
            if (permisoExistente != null)
            {
                return BadRequest($"Error: El permiso para el rol con ID {permisos.rolesId} y el modulo con ID {permisos.modulosId} ya existe.");
            }
            await _context.Permiso.AddAsync(permisos);
            await _context.SaveChangesAsync();
            return Ok();
        }
        [HttpGet]

        [Route("leer")]

        public async Task<ActionResult<List<Permiso>>> leer()

        {
            var permiso = await _context.Permiso
                .Include(p => p.permisosrolesId)
                .Include(p => p.permisosmodulosId)
                .ToListAsync();
            return Ok(permiso);
        }
        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar(int id)
        {
            Permiso permiso = await _context.Permiso
                .Include(p => p.permisosrolesId)
                .Include(p => p.permisosmodulosId)
                .FirstOrDefaultAsync(p => p.id == id);
            if (permiso == null)
            {
                return BadRequest($"Error: el permiso con el ID:{id}, no se encuentra en la base de datos");
            }
            return Ok(permiso);
        }
        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(Permiso permiso)
        {
            // Verificar si el objeto permiso es nulo
            if (permiso == null)
            {
                return BadRequest(new
                {
                    Estado = "no",
                    Mensaje = "El objeto permiso no puede ser nulo"
                });
            }
            // Buscar el permiso existente por su ID
            var Existentepermiso = await _context.Permiso.FindAsync(permiso.id);
            // Verificar si el permiso existente fue encontrado
            if (Existentepermiso == null)

            {
                return BadRequest(new
                {
                    Estado = "no",
                    Mensaje = "Permiso no encontrado"
                });
            }
            // Actualizar las propiedades del permiso existente
            Existentepermiso.leer = permiso.leer;
            Existentepermiso.editar = permiso.editar;
            Existentepermiso.consultar = permiso.consultar;
            Existentepermiso.insertar = permiso.insertar;
            Existentepermiso.eliminar = permiso.eliminar;
            Existentepermiso.exportar = permiso.exportar;
            Existentepermiso.importar = permiso.importar;

            // Guardar los cambios en la base de datos
            await _context.SaveChangesAsync();
            // Retornar una respuesta exitosa
            return Ok(new
            {
                Estado = "ok",
                Mensaje = "Permiso actualizado correctamente"
            });
        }
        [HttpDelete]
        [Route("eliminar")]
        public async Task<IActionResult> eliminar(int id)
        {
            var PermisoBorrado = await _context.Permiso.FindAsync(id);
            _context.Permiso.Remove(PermisoBorrado);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}