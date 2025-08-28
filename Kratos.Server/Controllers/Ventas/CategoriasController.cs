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
using Microsoft.AspNetCore.Mvc.Rendering;


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

        [HttpGet]
        [Route("leerCategoriaProducto")]
        public async Task<List<Categoria>> leerCategoriaProducto()
        {
            var listaCategorias = await _context.Categoria
                .Where(c => c.categoriapadreId == null && c.ProductoServicio == false)
                .ToListAsync();

            return listaCategorias;
        }
        [HttpGet]
        [Route("leerSubCategoriaProducto")]
        public async Task<List<Categoria>> leerSubCategoriaProducto(int categoria)
        {
            var listaSubCategorias = await _context.Categoria
                .Where(c => c.categoriapadreId == categoria && c.ProductoServicio == false)
                .ToListAsync();
            return listaSubCategorias;
        }
        [HttpGet]
        [Route("leerCategoriaServicio")]
        public async Task<List<Categoria>> leerCategoriaServicio()
        {
            var listaCategorias = await _context.Categoria
                .Where(c => c.categoriapadreId == null && c.ProductoServicio == true)
                .ToListAsync();

            return listaCategorias;
        }
        [HttpGet]
        [Route("leerSubCategoriaServicio")]
        public async Task<List<Categoria>> leerSubCategoriaServicio(int categoria)
        {
            var listaSubCategorias = await _context.Categoria
                .Where(c => c.categoriapadreId == categoria && c.ProductoServicio == true)
                .ToListAsync();
            return listaSubCategorias;
        }
    }
}