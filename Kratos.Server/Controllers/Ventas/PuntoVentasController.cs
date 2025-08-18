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
    public class PuntoVentasController : ControllerBase
    {
        private readonly KratosContext _context;
        public PuntoVentasController(KratosContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Route("insertar")]
        public async Task<IActionResult> insertar(PuntoVenta puntoVenta)
        {
            if (puntoVenta == null)
            {
                return BadRequest("Datos de punto de venta inválidos.");
            }

            await _context.PuntoVenta.AddAsync(puntoVenta);
            await _context.SaveChangesAsync();
            return Ok(puntoVenta);
        }

        [HttpGet]
        [Route("leer")]
        public async Task<List<PuntoVenta>> leer()
        {
            var puntos = await _context.PuntoVenta.ToListAsync();
            return puntos;
        }

        [HttpGet]
        [Route("consultar")]
        public async Task<PuntoVenta?> consultar(int id)
        {
            var punto = await _context.PuntoVenta.FirstOrDefaultAsync(p => p.id == id);
            return punto;
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(PuntoVenta punto)
        {
            var puntoExistente = await _context.PuntoVenta.FirstOrDefaultAsync(p => p.id == punto.id);
            if (puntoExistente == null)
            {
                return BadRequest();
            }
            puntoExistente.responsableId = punto.responsableId;
            puntoExistente.activo = punto.activo;
            puntoExistente.actualizadoEn = DateTime.Now;
            _context.PuntoVenta.Update(puntoExistente);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete]
        [Route("eliminar")]
        public async Task<IActionResult> eliminar(int id)
        {
            var punto = await _context.PuntoVenta.FindAsync(id);
            if (punto == null)
            {
                return BadRequest();
            }
            _context.PuntoVenta.Remove(punto);
            await _context.SaveChangesAsync();
            return Ok();
        }
      
    }
}
