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

        [HttpGet]
        [Route("leerCategoria")]
        public async Task<List<Categoria>> leerCategoria()
        {
            var listaCategorias = await _context.Categoria.ToListAsync();
            return listaCategorias;
        }
        [HttpGet]
        [Route("leerSubCategoria")]
        public async Task<List<Categoria>> leerSubCategoria(int categoria)
        {
            var listaSubCategorias = await _context.Categoria
                .Where(c => c.categoriapadreId == categoria)
                .ToListAsync();
            return listaSubCategorias;
        }
    }
}