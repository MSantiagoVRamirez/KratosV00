using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using kratos.Server.Services.Seguridad;
using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Seguridad;

namespace Kratos.Server.Controllers.Seguridad
{

    [Route("api/[controller]")]
    [ApiController]
    public class EmpresaController : ControllerBase
    {
        private readonly KratosContext _context;

        public EmpresaController(KratosContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Route("insertar")]
        public async Task<IActionResult> insertar(Empresa empresa)
        {
            var nombreNormalizado = empresa.nombreComercial.Trim().ToLower();
            var empresaExistente = await _context.Empresa.AnyAsync(a => a.nombreComercial.Trim().ToLower() == nombreNormalizado);
            if (empresaExistente)
            {
                BadRequest($"Error: {nombreNormalizado} ya se encuentra registrada.");
            }
            // validar las contraseñas
            if (empresa.contraseña != empresa.confirmarContraseña)
            {
                return BadRequest("Error: La contraseña no coincide.");
            }
            // Encriptar la contraseña y token
            empresa.contraseña = Encriptar.EncriptarClave(empresa.contraseña);
            empresa.confirmarContraseña = Encriptar.EncriptarClave(empresa.confirmarContraseña);
            empresa.token = Encriptar.EncriptarClave(empresa.token);
            empresa.creadoEn = DateTime.Now;
            // Agregar la empresa a la base de datos
            await _context.Empresa.AddAsync(empresa);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        [Route("leer")]
        public async Task<ActionResult<List<Empresa>>> leer()
        {
            var listaEmpresa = await _context.Empresa.ToListAsync();

            return Ok(listaEmpresa);
        }
        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar(int id)
        {
            Empresa empresa = await _context.Empresa.FindAsync(id);

            if (empresa == null)
            {
                return BadRequest($"No ha sido Encontrado el Registro con el ID: {id}");
            }
            return Ok(empresa);
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(Empresa empresa)
        {
            var empresaExistente = await _context.Empresa.FindAsync(empresa.id);
            if (empresaExistente == null)
            {
                return BadRequest("Error: el Registro que intenta editar no existe,Verifique nuevamente la informacion");
            }
            //validar nombre ya existe
            var nombreNormalizado = empresa.nombreComercial.Trim().ToLower();
            var empresaNombreExistente = await _context.Empresa.AnyAsync(a => a.nombreComercial.Trim().ToLower() == nombreNormalizado && a.id != empresa.id);
            if (empresaNombreExistente)
            {
                return BadRequest($"Error: {nombreNormalizado} ya se encuentra registrada.");
            }
            empresaExistente.tiposociedadId = empresa.tiposociedadId;
            empresaExistente.actividadId = empresa.actividadId;
            empresaExistente.regimenId = empresa.regimenId;
            empresaExistente.razonSocial = empresa.razonSocial;
            empresaExistente.nombreComercial = empresa.nombreComercial;
            empresaExistente.nit = empresa.nit;
            empresaExistente.dv = empresa.dv;
            empresaExistente.telefono = empresa.telefono;
            empresaExistente.email = empresa.email;
            empresaExistente.representanteLegal = empresa.representanteLegal;
            empresaExistente.activo = empresa.activo; 
            empresaExistente.actualizadoEn = DateTime.Now;
            try
            {
                _context.Empresa.Update(empresaExistente);
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
            var empresaBorrado = await _context.Empresa.FindAsync(Id);

            _context.Empresa.Remove(empresaBorrado);

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}