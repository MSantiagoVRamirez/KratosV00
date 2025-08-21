using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text.Json.Serialization;
using Kratos.Server.Models.Contexto;
using static System.Net.Mime.MediaTypeNames;
using Kratos.Server.Services.Storage;
using Kratos.Server.Models.Seguridad;


namespace Kratos.Server.Controllers.Ventas
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriasController : ControllerBase
    {
        private readonly KratosContext _context;
        private readonly IFilesHelper _filesHelper;

        public CategoriasController( KratosContext context,IFilesHelper filesHelper)
        {
            _context = context;
            _filesHelper = filesHelper;
        }
        [HttpPost]
        [Route("insertar")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Insertar( Categoria categoria)
        {
           
                categoria.CreadoEn = DateTime.Now;
                categoria.ActualizadoEn = DateTime.Now;
                _context.Add(categoria);
                await _context.SaveChangesAsync();
                return Ok();
        }

        [HttpGet]
        [Route("leer")]
        public async Task<ActionResult<List<Categoria>>> leer()
        {
            var listaCategorias = await _context.Categoria.ToListAsync();

            return Ok(listaCategorias);
        }
        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> consultar(int id)
        {
            Categoria categoria = await _context.Categoria.FindAsync(id);

            if (categoria == null)
            {
                return BadRequest($"No ha sido Encontrado el Registro con el ID: {id}");
            }
            return Ok(categoria);
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> editar(Categoria categoria)
        {
            var categoriaExistente = await _context.Categoria.FindAsync(categoria.Id);
            if (categoriaExistente == null)
            {
                return BadRequest("Error: el Registro que intenta editar no existe,Verifique nuevamente la informacion");
            }
            //validar si el nombre ya existe
            var nombreNormalizado = categoria.Nombre.Trim().ToLower();
            var categoriaNombreExistente = await _context.Rol
                .AnyAsync(a => a.nombre.Trim().ToLower() == nombreNormalizado && a.id != categoria.Id);
            if (categoriaNombreExistente)
            {
                return BadRequest($"Error: {nombreNormalizado} ya se encuentra registrada.");
            }
            categoriaExistente.categoriapadreId = categoria.categoriapadreId;
            categoriaExistente.Nombre = categoria.Nombre;
            categoriaExistente.Descripcion = categoria.Descripcion;
            //categoriaExistente.ImagenUrl = categoria.ImagenUrl;
            categoriaExistente.Activo = categoria.Activo;
            categoriaExistente.CreadoEn = categoria.CreadoEn;
            categoriaExistente.ActualizadoEn = DateTime.Now;
            try
            {
                _context.Categoria.Update(categoriaExistente);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, "Error al actualizar la categoria en la base de datos.");
            }
            return Ok();
        }
        [HttpDelete]
        [Route("eliminar")]
        public async Task<IActionResult> eliminar(int Id)
        {
            var categoriaBorrado = await _context.Categoria.FindAsync(Id);
            _context.Categoria.Remove(categoriaBorrado);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}