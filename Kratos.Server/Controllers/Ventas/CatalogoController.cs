using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Ventas;
using Kratos.Server.Services.Storage;

namespace Kratos.Server.Controllers.Ventas
{
    [Route("api/[controller]")]
    [ApiController]
    public class CatalogoController : ControllerBase
    {
        private readonly KratosContext _context;
        private readonly IFilesHelper _filesHelper;
        public CatalogoController(KratosContext context, IFilesHelper filesHelper)
        {
            _context = context;
            _filesHelper = filesHelper;
        }

        // ============ Carrusel ============
        [HttpGet("carousel/leer")]
        public async Task<ActionResult<IEnumerable<CatalogoItemCarrusel>>> LeerCarrusel(int empresaId, string? seccion = null)
        {
            var query = _context.CatalogoItemCarrusel.AsQueryable();
            query = query.Where(c => c.empresaId == empresaId);
            if (!string.IsNullOrWhiteSpace(seccion))
                query = query.Where(c => c.seccion == seccion);
            var list = await query
                .OrderBy(c => c.orden)
                .ToListAsync();
            return Ok(list);
        }

        [HttpPost("carousel/insertar")]
        public async Task<IActionResult> InsertarCarrusel([FromForm] CatalogoItemCarrusel item)
        {
            if (item.ImagenArchivo != null && item.ImagenArchivo.Length > 0)
            {
                await using var stream = item.ImagenArchivo.OpenReadStream();
                var url = await _filesHelper.SubirArchivo(stream, item.ImagenArchivo.FileName);
                item.imagenUrl = url;
            }
            if (string.IsNullOrWhiteSpace(item.seccion)) item.seccion = "productos"; // por defecto
            item.creadoEn = DateTime.Now;
            await _context.CatalogoItemCarrusel.AddAsync(item);
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        [HttpPut("carousel/editar")]
        public async Task<IActionResult> EditarCarrusel([FromForm] CatalogoItemCarrusel item)
        {
            var existente = await _context.CatalogoItemCarrusel.FindAsync(item.id);
            if (existente == null) return BadRequest("Item no existe");
            if (item.ImagenArchivo != null && item.ImagenArchivo.Length > 0)
            {
                await using var stream = item.ImagenArchivo.OpenReadStream();
                var url = await _filesHelper.SubirArchivo(stream, item.ImagenArchivo.FileName);
                existente.imagenUrl = url;
            }
            existente.titulo = item.titulo;
            existente.descripcion = item.descripcion;
            existente.tituloColor = item.tituloColor;
            existente.orden = item.orden;
            existente.intervaloMs = item.intervaloMs > 0 ? item.intervaloMs : existente.intervaloMs;
            if (!string.IsNullOrWhiteSpace(item.seccion)) existente.seccion = item.seccion;
            existente.activo = item.activo;
            existente.actualizadoEn = DateTime.Now;
            _context.CatalogoItemCarrusel.Update(existente);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("carousel/eliminar")]
        public async Task<IActionResult> EliminarCarrusel(int id)
        {
            var item = await _context.CatalogoItemCarrusel.FindAsync(id);
            if (item == null) return NotFound();
            _context.CatalogoItemCarrusel.Remove(item);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // ============ Productos Config ============
        public class ProductoConfigDto
        {
            public int productoId { get; set; }
            public bool visible { get; set; }
            public string? tituloPersonalizado { get; set; }
            public string? descripcionPersonalizada { get; set; }
            public string? palabrasClave { get; set; }
        }

        [HttpGet("productos/leerConfig")]
        public async Task<ActionResult<IEnumerable<object>>> LeerProductosConfig(int empresaId)
        {
            var productos = await _context.Producto
                .Select(p => new
                {
                    p.id,
                    p.codigo,
                    p.nombre,
                    p.descripcion,
                    p.precio,
                })
                .ToListAsync();

            var cfg = await _context.CatalogoProductoConfig
                .Where(c => c.empresaId == empresaId)
                .ToListAsync();

            var result = productos.Select(p =>
            {
                var c = cfg.FirstOrDefault(x => x.productoId == p.id);
                return new
                {
                    productoId = p.id,
                    p.codigo,
                    p.nombre,
                    p.descripcion,
                    p.precio,
                    visible = c?.visible ?? true,
                    tituloPersonalizado = c?.tituloPersonalizado,
                    descripcionPersonalizada = c?.descripcionPersonalizada,
                    palabrasClave = c?.palabrasClave
                };
            });

            return Ok(result);
        }

        [HttpPut("productos/guardar")]
        public async Task<IActionResult> GuardarProductoConfig(int empresaId, [FromBody] ProductoConfigDto model)
        {
            var existente = await _context.CatalogoProductoConfig
                .FirstOrDefaultAsync(c => c.empresaId == empresaId && c.productoId == model.productoId);

            if (existente == null)
            {
                var nuevo = new CatalogoProductoConfig
                {
                    empresaId = empresaId,
                    productoId = model.productoId,
                    visible = model.visible,
                    tituloPersonalizado = model.tituloPersonalizado,
                    descripcionPersonalizada = model.descripcionPersonalizada,
                    palabrasClave = model.palabrasClave,
                    creadoEn = DateTime.Now
                };
                _context.CatalogoProductoConfig.Add(nuevo);
            }
            else
            {
                existente.visible = model.visible;
                existente.tituloPersonalizado = model.tituloPersonalizado;
                existente.descripcionPersonalizada = model.descripcionPersonalizada;
                existente.palabrasClave = model.palabrasClave;
                existente.actualizadoEn = DateTime.Now;
                _context.CatalogoProductoConfig.Update(existente);
            }
            await _context.SaveChangesAsync();
            return Ok();
        }

        // ============ Auxiliar: Leer servicios (productoServicio == true) ============
        [HttpGet("productos/leerServicios")]
        public async Task<ActionResult<IEnumerable<object>>> LeerServicios()
        {
            var list = await _context.Producto
                .Where(p => p.productoServicio == true)
                .Select(p => new { p.id, p.codigo, p.nombre, p.descripcion, p.precio, p.productoServicio })
                .ToListAsync();
            return Ok(list);
        }
    }
}
