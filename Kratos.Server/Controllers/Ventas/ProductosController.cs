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

namespace Kratos.Server.Controllers.Ventas
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductosController : ControllerBase
    {
        private readonly KratosContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ProductosController> _logger;

        public ProductosController(
            KratosContext context,
            IWebHostEnvironment environment,
            ILogger<ProductosController> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        [HttpGet("leer")]
        public async Task<ActionResult<IEnumerable<Producto>>> Leer()
        {
            return await _context.Producto
                .Include(p => p.categoriaFk)
                .Include(p => p.impuestoFk)
                .ToListAsync();
        }

        [HttpGet("consultar")]
        public async Task<ActionResult<Producto>> Consultar(int id)
        {
            var producto = await _context.Producto
                .Include(p => p.categoriaFk)
                .Include(p => p.impuestoFk)
                .FirstOrDefaultAsync(p => p.id == id);

            if (producto == null)
            {
                return NotFound();
            }

            return producto;
        }

        [HttpPost("insertar")]
        public async Task<ActionResult<Producto>> Insertar([FromForm] Producto producto, IFormFile imagenArchivo)
        {
            // Validar código único
            if (await _context.Producto.AnyAsync(p => p.codigo == producto.codigo))
            {
                return Conflict("Ya existe un producto con este código");
            }

            // Manejo de imagen
            if (imagenArchivo != null && imagenArchivo.Length > 0)
            {
                producto.imagenUrl = await GuardarImagen(imagenArchivo);
            }

            producto.creadoEn = DateTime.Now;
            producto.actualizadoEn = DateTime.Now;

            _context.Producto.Add(producto);
            await _context.SaveChangesAsync();

            return CreatedAtAction("Consultar", new { producto.id }, producto);
        }

        [HttpPut("editar")]
        public async Task<IActionResult> Editar([FromForm] Producto producto, IFormFile imagenArchivo)
        {
            var productoExistente = await _context.Producto.FindAsync(producto.id);
            if (productoExistente == null)
            {
                return NotFound();
            }

            // Validar código único
            if (await _context.Producto.AnyAsync(p => p.codigo == producto.codigo && p.id != producto.id))
            {
                return Conflict("Ya existe un producto con este código");
            }

            // Manejo de imagen
            if (imagenArchivo != null && imagenArchivo.Length > 0)
            {
                // Eliminar imagen anterior si existe
                if (!string.IsNullOrEmpty(productoExistente.imagenUrl))
                {
                    EliminarImagen(productoExistente.imagenUrl);
                }
                productoExistente.imagenUrl = await GuardarImagen(imagenArchivo);
            }

            // Actualizar otros campos
            productoExistente.codigo = producto.codigo;
            productoExistente.nombre = producto.nombre;
            productoExistente.descripcion = producto.descripcion;
            productoExistente.categoriaId = producto.categoriaId;
            productoExistente.impuestoId = producto.impuestoId;
            productoExistente.precio = producto.precio;
            productoExistente.costo = producto.costo;
            productoExistente.stockMinimo = producto.stockMinimo;
            productoExistente.activo = producto.activo;
            productoExistente.actualizadoEn = DateTime.Now;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("eliminar")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var producto = await _context.Producto.FindAsync(id);
            if (producto == null)
            {
                return NotFound();
            }

            // Eliminar imagen asociada si existe
            if (!string.IsNullOrEmpty(producto.imagenUrl))
            {
                EliminarImagen(producto.imagenUrl);
            }

            _context.Producto.Remove(producto);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<string> GuardarImagen(IFormFile imagenArchivo)
        {
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "productos");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(imagenArchivo.FileName)}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await imagenArchivo.CopyToAsync(fileStream);
            }

            return Path.Combine("uploads", "productos", uniqueFileName).Replace("\\", "/");
        }

        private void EliminarImagen(string imagenUrl)
        {
            var imagePath = Path.Combine(_environment.WebRootPath, imagenUrl);
            if (System.IO.File.Exists(imagePath))
            {
                try
                {
                    System.IO.File.Delete(imagePath);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al eliminar la imagen del producto");
                }
            }
        }
    }
}