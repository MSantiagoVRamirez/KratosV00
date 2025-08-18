using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Seguridad;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kratos.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConsultasRegistroController : ControllerBase
    {
        private readonly KratosContext _context;
        public ConsultasRegistroController(KratosContext context)
        {
            _context = context;
        }
        [HttpGet]
        [Route("ListaActivdad")]
        public async Task<List<ActividadEconomica>> ListaActivdad()
        {
            var listaActividad = await _context.ActividadEconomica.ToListAsync();
            return listaActividad;
        }
        [HttpGet]
        [Route("ListaRegimenTributario")]
        public async Task<List<RegimenTributario>> ListaRegimenTributario()
        {
            var listaRegimen = await _context.RegimenTributario.ToListAsync();
            return listaRegimen;
        }
        [HttpGet]
        [Route("ListaTipoSociedad")]
        public async Task<List<TipoSociedad>> ListaTipoSociedad()
        {
            var listaTipoSociedad = await _context.TipoSociedad.ToListAsync();
            return listaTipoSociedad;
        }



        [HttpGet]
        [Route("ListaModulos")]
        public async Task<List<Modulo>> ListaModulos()
        {
            var listaModulos = await _context.Modulo.ToListAsync();
            return listaModulos;
        }

        [HttpGet]
        [Route("ListaRoles")]
        public async Task<List<Rol>> ListaRoles()
        {
            var listaRoles = await _context.Rol.ToListAsync();
            return listaRoles;
        }

        [HttpGet]
        [Route("ListaPermisos")]
        public async Task<List<Permiso>> ListaPermisos()
        {
            var listaPermisos = await _context.Permiso.ToListAsync();
            return listaPermisos;
        }

        [HttpGet]
        [Route("ListaEmpresas")]
        public async Task<List<Empresa>> ListaEmpresas()
        {
            var listaEmpresas = await _context.Empresa.ToListAsync();
            return listaEmpresas;
        }
    }
}
