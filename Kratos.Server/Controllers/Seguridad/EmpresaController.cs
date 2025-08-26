using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using kratos.Server.Services.Seguridad;
using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Seguridad;
using System.Runtime.CompilerServices;
using Kratos.Server.Services.Storage;

namespace Kratos.Server.Controllers.Seguridad
{

    [Route("api/[controller]")]
    [ApiController]
    public class EmpresaController : ControllerBase
    {
        private readonly KratosContext _context;
        private readonly IUsuarioService _usuarioService;
        private readonly IFilesHelper _filesHelper;

        public EmpresaController(KratosContext context, IUsuarioService usuarioService, IFilesHelper filesHelper)
        {
            _context = context;
            _usuarioService = usuarioService;
            _filesHelper = filesHelper;
        }

        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar()
        {
            var usuarioLog = await _usuarioService.ObtenerIdUsuarioLogueado();
            if (usuarioLog == null)
            {
                return BadRequest("Error: No se ha encontrado el usuario logueado.");
            }
            Empresa empresa = await _context.Empresa.FindAsync(usuarioLog.id);

            if (empresa == null)
            {
                return BadRequest($"No ha sido Encontrado");
            }
            return Ok(empresa);
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar([FromForm] EmpresaEditarDto dto)
        {
            var empresaExistente = await _context.Empresa.FindAsync(dto.id);
            if (empresaExistente == null)
                return BadRequest("Error: el Registro que intenta editar no existe, Verifique nuevamente la informacion");

            // Nombre duplicado
            var nombreNormalizado = dto.nombreComercial.Trim().ToLower();
            var existeNombre = await _context.Empresa
                .AnyAsync(a => a.nombreComercial.Trim().ToLower() == nombreNormalizado && a.id != dto.id);
            if (existeNombre)
                return BadRequest($"Error: {nombreNormalizado} ya se encuentra registrada.");

            // Imagen: archivo tiene prioridad sobre ImagenUrl
            if (dto.ImagenArchivo is { Length: > 0 })
            {
                await using var image = dto.ImagenArchivo.OpenReadStream();
                string urlimagen = await _filesHelper.SubirArchivo(image, dto.ImagenArchivo.FileName);
                empresaExistente.ImagenUrl = urlimagen;
            }
            else if (!string.IsNullOrWhiteSpace(dto.ImagenUrl))
            {
                empresaExistente.ImagenUrl = dto.ImagenUrl;
            }

            // Mapear campos editables
            empresaExistente.tiposociedadId = dto.tiposociedadId;
            empresaExistente.actividadId = dto.actividadId;
            empresaExistente.regimenId = dto.regimenId;
            empresaExistente.razonSocial = dto.razonSocial;
            empresaExistente.nombreComercial = dto.nombreComercial;
            empresaExistente.nit = dto.nit;
            empresaExistente.dv = dto.dv;
            empresaExistente.telefono = dto.telefono;
            empresaExistente.email = dto.email;
            empresaExistente.representanteLegal = dto.representanteLegal;
            empresaExistente.activo = dto.activo;
            empresaExistente.actualizadoEn = DateTime.Now;

            try
            {
                _context.Empresa.Update(empresaExistente);
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, "Error al actualizar la empresa en la base de datos.");
            }
        }

        [HttpGet]
        [Route("leer")]
        public async Task<List<Empresa>> leer()
        {
            var empresas = await _context.Empresa.ToListAsync();
            return empresas;
        }
    }
}