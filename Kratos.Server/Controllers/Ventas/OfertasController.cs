using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Ventas;

namespace Kratos.Server.Controllers.Ventas
{
    [Route("api/[controller]")]
    [ApiController]
    public class OfertasController : ControllerBase
    {
        private readonly KratosContext _context;

        public OfertasController(KratosContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Route("insertar")]
        public async Task<IActionResult> insertar([FromBody] Oferta oferta)
        {
            if (oferta.fechaFin < oferta.fechaInicio)
            {
                return BadRequest("La fecha fin no puede ser anterior a la fecha de inicio.");
            }

            oferta.creadoEn = DateTime.Now;
            oferta.actualizadoEn = null;

            await _context.Oferta.AddAsync(oferta);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet]
        [Route("leer")]
        public async Task<ActionResult<IEnumerable<object>>> leer(int? empresaId = null)
        {
            var query = _context.Oferta
                .Include(o => o.productoFk)
                .AsQueryable();

            if (empresaId.HasValue)
            {
                query = query.Where(o => o.empresaId == empresaId.Value);
            }

            var list = await query
                .OrderByDescending(o => o.creadoEn)
                .Select(o => new
                {
                    o.id,
                    o.productoId,
                    productoNombre = o.productoFk != null ? o.productoFk.nombre : null,
                    o.empresaId,
                    o.fechaInicio,
                    o.fechaFin,
                    o.porcentajeDescuento,
                    o.activo,
                    o.creadoEn,
                    o.actualizadoEn
                })
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar(int id)
        {
            var oferta = await _context.Oferta.FindAsync(id);
            if (oferta == null)
            {
                return BadRequest($"No ha sido encontrada la oferta con el ID: {id}");
            }
            return Ok(oferta);
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar([FromBody] Oferta oferta)
        {
            var existente = await _context.Oferta.FindAsync(oferta.id);
            if (existente == null)
            {
                return BadRequest("Error: la oferta que intenta editar no existe.");
            }
            if (oferta.fechaFin < oferta.fechaInicio)
            {
                return BadRequest("La fecha fin no puede ser anterior a la fecha de inicio.");
            }

            existente.productoId = oferta.productoId;
            existente.empresaId = oferta.empresaId;
            existente.fechaInicio = oferta.fechaInicio;
            existente.fechaFin = oferta.fechaFin;
            existente.porcentajeDescuento = oferta.porcentajeDescuento;
            existente.activo = oferta.activo;
            existente.actualizadoEn = DateTime.Now;

            try
            {
                _context.Oferta.Update(existente);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, "Error al actualizar la oferta en la base de datos.");
            }
            return Ok();
        }

        [HttpDelete]
        [Route("eliminar")]
        public async Task<IActionResult> eliminar(int id)
        {
            var oferta = await _context.Oferta.FindAsync(id);
            if (oferta == null)
            {
                return NotFound();
            }
            _context.Oferta.Remove(oferta);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}

