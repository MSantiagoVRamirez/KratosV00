using kratos.Server.Services.Seguridad;
using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Seguridad;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kratos.Server.Controllers.Seguridad
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly KratosContext _context;

        public UsuariosController(KratosContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Route("insertar")]
        public async Task<IActionResult> insertar(Usuario usuario)
        {
            var nombreNormalizado = usuario.email.Trim().ToLower();
            var usuarioExistente = await _context.Usuario.AnyAsync(a => a.email.Trim().ToLower() == nombreNormalizado);
            if (usuarioExistente)
            {
                BadRequest($"Error: {nombreNormalizado} ya se encuentra registrada.");
            }
            // validar las contraseñas
            if (usuario.contraseña != usuario.confirmarContraseña)
            {
                return BadRequest("Error: La contraseña no coincide.");
            }
            // Encriptar la contraseña y token
            usuario.contraseña = Encriptar.EncriptarClave(usuario.contraseña);
            usuario.confirmarContraseña = Encriptar.EncriptarClave(usuario.confirmarContraseña);
            usuario.token = Encriptar.EncriptarClave(usuario.token);
            //Validar token con la emprresa y asignar rol
            var empresaReferencia = await _context.Empresa.Where(e => e.token == usuario.token).FirstOrDefaultAsync();
            if (empresaReferencia == null)
            {
                return BadRequest("Error: Token Invalido, Verifique e intente nuevamente");
            }
            usuario.creadoEn = DateTime.Now;
            usuario.rolesId = 2;
            // Agregar la empresa a la base de datos
            await _context.Usuario.AddAsync(usuario);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        [Route("leer")]
        public async Task<ActionResult<List<Usuario>>> leer()
        {
            var listaUsuario = await _context.Usuario.ToListAsync();

            return Ok(listaUsuario);
        }
        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar(int id)
        {
            Usuario usuario = await _context.Usuario.FindAsync(id);

            if (usuario == null)
            {
                return BadRequest($"No ha sido Encontrado el Registro con el ID: {id}");
            }
            return Ok(usuario);
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(Usuario usuario)
        {
            var usuarioExistente = await _context.Usuario.FindAsync(usuario.id);
            if (usuarioExistente == null)
            {
                return BadRequest("Error: el Registro que intenta editar no existe,Verifique nuevamente la informacion");
            }
            //validar nombre ya existe
            var nombreNormalizado = usuario.email.Trim().ToLower();
            var usuarioNombreExistente = await _context.Usuario.AnyAsync(u => u.email.Trim().ToLower() == nombreNormalizado && u.id != usuario.id);
            if (usuarioNombreExistente)
            {
                return BadRequest($"Error: {nombreNormalizado} ya se encuentra registrado.");
            }
            usuarioExistente.rolesId = usuario.rolesId;
            usuarioExistente.email = usuario.email;
            usuarioExistente.nombres = usuario.nombres;
            usuarioExistente.apellidos = usuario.apellidos;
            usuarioExistente.telefono = usuario.telefono;
            usuarioExistente.estado = usuario.estado;
            usuarioExistente.actualizadoEn = DateTime.Now;
            try
            {
                _context.Usuario.Update(usuarioExistente);
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
            var usuarioBorrado = await _context.Usuario.FindAsync(Id);

            _context.Usuario.Remove(usuarioBorrado);

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}