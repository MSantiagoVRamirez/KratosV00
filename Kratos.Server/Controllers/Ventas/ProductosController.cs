using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Kratos.Server.Models.Ventas;
using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Seguridad;
using Kratos.Server.Services.Storage;

namespace Kratos.Server.Controllers.Ventas
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductosController : ControllerBase
    {
        private readonly KratosContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ProductosController> _logger;
        private readonly IFilesHelper _filesHelper;

        public ProductosController(KratosContext context, IWebHostEnvironment environment, ILogger<ProductosController> logger, IFilesHelper filesHelper)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
            _filesHelper = filesHelper;
        }

        [HttpPost("insertar")]
        public async Task<ActionResult<Producto>> Insertar([FromForm] Producto producto, IFormFile imagenArchivo)
        {
            // Validar código único
            if (await _context.Producto.AnyAsync(p => p.codigo == producto.codigo))
            {
                return Conflict("Ya existe un producto con este código");
            }

            producto.creadoEn = DateTime.Now;
            producto.actualizadoEn = DateTime.Now;

            if (producto.ImagenArchivo is { Length: > 0 })
            {
                await using Stream image = producto.ImagenArchivo.OpenReadStream();
                string urlimagen = await _filesHelper.SubirArchivo(image, producto .ImagenArchivo.FileName);
                producto.ImagenUrl = urlimagen;
            }

            _context.Producto.Add(producto);
            await _context.SaveChangesAsync();

            return CreatedAtAction("Consultar", new { producto.id }, producto);
        }

        [HttpGet("leer")]
        public async Task<ActionResult<IEnumerable<Producto>>> Leer()
        {
            return await _context.Producto
                .Where(p => p.productoServicio == false)
                .Include(p => p.categoriaFk)
                .ToListAsync();
        }

        [HttpGet("consultar")]
        public async Task<ActionResult<Producto>> Consultar(int id)
        {
            var producto = await _context.Producto
                .Include(p => p.categoriaFk)
                .FirstOrDefaultAsync(p => p.id == id);

            if (producto == null)
            {
                return NotFound();
            }

            return producto;
        }

       

        [HttpPut("editar")]
        public async Task<IActionResult> Editar([FromForm] Producto producto)
        {
            var productoExistente = await _context.Producto.FindAsync(producto.id);
            if (productoExistente == null)
            {
                return NotFound();
            }
            if (producto.ImagenArchivo is { Length: > 0 })
            {
                await using Stream image = producto.ImagenArchivo.OpenReadStream();
                string urlimagen = await _filesHelper.SubirArchivo(image, producto.ImagenArchivo.FileName);
                producto.ImagenUrl = urlimagen;
            }

            // Actualizar otros campos
            productoExistente.codigo = producto.codigo;
            productoExistente.nombre = producto.nombre;
            productoExistente.descripcion = producto.descripcion;
            productoExistente.categoriaId = producto.categoriaId;
            productoExistente.subCategoriaId = producto.subCategoriaId;
            productoExistente.precio = producto.precio;
            productoExistente.costo = producto.costo;
            productoExistente.stockMinimo = producto.stockMinimo;
            productoExistente.activo = producto.activo;
            productoExistente.actualizadoEn = DateTime.Now;
            productoExistente.ImagenUrl = producto.ImagenUrl;
            try
            {
                _context.Producto.Update(productoExistente);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {

                return StatusCode(500, "Error al actualizar el Producto en la base de datos.");
            }
            return Ok();
        }

        [HttpDelete("eliminar")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var producto = await _context.Producto.FindAsync(id);
            if (producto == null)
            {
                return NotFound();
            }

            _context.Producto.Remove(producto);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}