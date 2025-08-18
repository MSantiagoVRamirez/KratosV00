using Kratos.Server.Filters;
using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Ventas;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kratos.Server.Controllers.Ventas
{
    [Route("api/[controller]")]
    [ApiController]
    [ServiceFilter(typeof(PermisoAuthorizationFilter))]
    public class CompraController : ControllerBase
    {
        private readonly KratosContext _context;

        public CompraController(KratosContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Route("insertar")]

        public async Task<IActionResult> insertar(Compra compra)
        {
            var numeroFactura = compra.numeroFactura.Trim().ToLower();
            var CompraExistente = await _context.Compra.AnyAsync(c => c.numeroFactura.Trim().ToLower() == numeroFactura);
            if (CompraExistente)
            {
                BadRequest($"Ya existe una factura registrada con el numero '{compra.numeroFactura}'.");
            }
            await _context.Compra.AddAsync(compra);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        [Route("leer")]
        public async Task<ActionResult<IEnumerable<Compra>>> leer()
        {
            var compras = await _context.Compra.ToListAsync();

            return Ok(compras);
        }
        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar(int id)
        {
            Compra compra = await _context.Compra.FindAsync(id);

            if (compra == null)
            {
                return BadRequest($"No ha sido Encontrada la Compra con el ID: {id}");
            }
            return Ok(compra);
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(Compra compra)
        {
            var compraExistente = await _context.Compra.FindAsync(compra.id);
            if (compraExistente == null)
            {
                return BadRequest("Error: el dato que intenta editar no existe,Verifique nuevamente la informacion");
            }
            compraExistente.numeroFactura = compra.numeroFactura;
            compraExistente.fecha = compra.fecha;
            compraExistente.total = compra.total;
            compraExistente.tipoCompra = compra.tipoCompra;
            compraExistente.tipoPago = compra.tipoPago;
            compraExistente.estado = compra.estado;



            try
            {
                _context.Compra.Update(compraExistente);
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
            var compraBorrado = await _context.Compra.FindAsync(Id);

            _context.Compra.Remove(compraBorrado);

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
