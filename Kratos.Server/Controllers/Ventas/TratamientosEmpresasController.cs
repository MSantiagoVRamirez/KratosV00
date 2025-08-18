using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Kratos.Server.Models.Ventas;
using Kratos.Server.Models.Contexto;

namespace Kratos.Server.Controllers.Ventas
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TratamientosEmpresasController : ControllerBase
    {
        private readonly KratosContext _context;
        public TratamientosEmpresasController(KratosContext context)
        {
            _context = context;
        }
            [HttpPost]
            [Route("insertar")]
            public async Task<IActionResult> insertar(TratamientoEmpresa tratamiento)
            {
                if (tratamiento == null)
                {
                    return BadRequest("Datos de tratamiento inválidos.");
                }

                await _context.TratamientoEmpresa.AddAsync(tratamiento);
                await _context.SaveChangesAsync();
                return Ok(tratamiento);
            }
        [HttpGet]
        [Route("leer")]
        public async Task<List<TratamientoEmpresa>> leer()
        {
            var tratamientos = await _context.TratamientoEmpresa.ToListAsync();
            return tratamientos;
        }

        [HttpGet]
        [Route("consultar")]
        public async Task<TratamientoEmpresa?> consultar(int id)
        {
            var tratamiento = await _context.TratamientoEmpresa.FirstOrDefaultAsync(t => t.id == id);
            return tratamiento;
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(TratamientoEmpresa tratamiento)
        {
            var tratamientoExistente = await _context.TratamientoEmpresa.FirstOrDefaultAsync(t => t.id == tratamiento.id);
            if (tratamientoExistente == null)
            {
                return BadRequest();
            }
            tratamientoExistente.empresaId = tratamiento.empresaId;
            _context.TratamientoEmpresa.Update(tratamientoExistente);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete]
        [Route("eliminar")]
        public async Task<IActionResult> eliminar(int id)
        {
            var tratamiento = await _context.TratamientoEmpresa.FindAsync(id);
            if (tratamiento == null)
            {
                return BadRequest();
            }
            _context.TratamientoEmpresa.Remove(tratamiento);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
