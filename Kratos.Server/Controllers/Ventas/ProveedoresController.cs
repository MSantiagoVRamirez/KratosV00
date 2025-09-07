using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kratos.Server.Models.Contexto;
using Kratos.Server.Models.Ventas;
using Kratos.Server.Models.Seguridad;
using System.Security.Claims;

namespace Kratos.Server.Controllers.Ventas
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProveedoresController : ControllerBase
    {
        private readonly KratosContext _context;

        public ProveedoresController(KratosContext context)
        {
            _context = context;
        }

        private async Task<int> ObtenerEmpresaIdActualAsync()
        {
            var user = HttpContext.User;
            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return 0;

            var tipoLogin = user.FindFirst("tipoLogin")?.Value;
            var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(tipoLogin) || string.IsNullOrEmpty(idClaim))
                return 0;

            if (tipoLogin == "1")
            {
                // Sesión como Empresa: NameIdentifier es el id de la empresa
                return int.TryParse(idClaim, out var empresaId) ? empresaId : 0;
            }
            else if (tipoLogin == "2")
            {
                // Sesión como Usuario: buscar su empresa por token compartido
                if (!int.TryParse(idClaim, out var usuarioId)) return 0;
                var usuario = await _context.Usuario.FirstOrDefaultAsync(u => u.id == usuarioId);
                if (usuario == null) return 0;
                var empresa = await _context.Empresa.FirstOrDefaultAsync(e => e.token == usuario.token);
                return empresa?.id ?? 0;
            }

            return 0;
        }

        [HttpPost]
        [Route("insertar")]
        public async Task<IActionResult> Insertar([FromBody] Proveedor proveedor)
        {
            var empresaId = await ObtenerEmpresaIdActualAsync();
            if (empresaId == 0)
                return Unauthorized("No se pudo determinar la empresa del usuario actual.");

            if (proveedor == null)
                return BadRequest("Datos de proveedor inválidos.");

            if (string.IsNullOrWhiteSpace(proveedor.nombre))
                return BadRequest("El nombre es obligatorio.");
            if (string.IsNullOrWhiteSpace(proveedor.email))
                return BadRequest("El email es obligatorio.");
            if (string.IsNullOrWhiteSpace(proveedor.telefono))
                return BadRequest("El teléfono es obligatorio.");

            // Fijar empresa del proveedor al contexto actual
            proveedor.empresaId = empresaId;

            // Unicidad básica por email dentro de la empresa
            var existeEmail = await _context.Proveedor.AnyAsync(p => p.empresaId == empresaId && p.email == proveedor.email);
            if (existeEmail)
                return Conflict("Ya existe un proveedor con el mismo email en esta empresa.");

            _context.Proveedor.Add(proveedor);
            await _context.SaveChangesAsync();
            return Ok(proveedor);
        }

        [HttpGet]
        [Route("leer")]
        public async Task<ActionResult<List<Proveedor>>> Leer()
        {
            var empresaId = await ObtenerEmpresaIdActualAsync();
            if (empresaId == 0)
                return Unauthorized("No se pudo determinar la empresa del usuario actual.");

            var proveedores = await _context.Proveedor
                .Where(p => p.empresaId == empresaId)
                .ToListAsync();
            return Ok(proveedores);
        }

        [HttpGet]
        [Route("consultar")]
        public async Task<IActionResult> Consultar(int id)
        {
            var empresaId = await ObtenerEmpresaIdActualAsync();
            if (empresaId == 0)
                return Unauthorized("No se pudo determinar la empresa del usuario actual.");

            var proveedor = await _context.Proveedor.FirstOrDefaultAsync(p => p.id == id && p.empresaId == empresaId);
            if (proveedor == null)
                return NotFound();

            return Ok(proveedor);
        }

        [HttpPut]
        [Route("editar")]
        public async Task<IActionResult> Editar([FromBody] Proveedor proveedor)
        {
            var empresaId = await ObtenerEmpresaIdActualAsync();
            if (empresaId == 0)
                return Unauthorized("No se pudo determinar la empresa del usuario actual.");

            var existente = await _context.Proveedor.FirstOrDefaultAsync(p => p.id == proveedor.id && p.empresaId == empresaId);
            if (existente == null)
                return NotFound("Proveedor no encontrado para esta empresa.");

            if (string.IsNullOrWhiteSpace(proveedor.nombre))
                return BadRequest("El nombre es obligatorio.");
            if (string.IsNullOrWhiteSpace(proveedor.email))
                return BadRequest("El email es obligatorio.");
            if (string.IsNullOrWhiteSpace(proveedor.telefono))
                return BadRequest("El teléfono es obligatorio.");

            var emailDuplicado = await _context.Proveedor.AnyAsync(p => p.empresaId == empresaId && p.email == proveedor.email && p.id != proveedor.id);
            if (emailDuplicado)
                return Conflict("Ya existe otro proveedor con el mismo email en esta empresa.");

            existente.nombre = proveedor.nombre;
            existente.email = proveedor.email;
            existente.telefono = proveedor.telefono;
            existente.direccion = proveedor.direccion;

            _context.Proveedor.Update(existente);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete]
        [Route("eliminar")]
        public async Task<IActionResult> Eliminar(int Id)
        {
            var empresaId = await ObtenerEmpresaIdActualAsync();
            if (empresaId == 0)
                return Unauthorized("No se pudo determinar la empresa del usuario actual.");

            var proveedor = await _context.Proveedor.FirstOrDefaultAsync(p => p.id == Id && p.empresaId == empresaId);
            if (proveedor == null)
                return NotFound();

            _context.Proveedor.Remove(proveedor);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}

