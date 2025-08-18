using kratos.Server.Services.Seguridad;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;


namespace Kratos.Server.Filters
{
    public class PermisoAuthorizationFilter : IAsyncActionFilter
    {
        private readonly IUsuarioService _usuarioService;
        private readonly ILogger<PermisoAuthorizationFilter> _logger; // Agregar ILogger

        public PermisoAuthorizationFilter(IUsuarioService usuarioService, ILogger<PermisoAuthorizationFilter> logger)
        {
            _usuarioService = usuarioService;
            _logger = logger;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var user = context.HttpContext.User;

            // Verificar si el usuario está autenticado
            if (!user.Identity.IsAuthenticated)
            {
                _logger.LogInformation("Usuario no autenticado.");
                context.Result = new ContentResult { Content = "No autenticado." };
                return;
            }

            // Obtener el ID del módulo según el nombre del controlador
            var moduloNombre = context.ActionDescriptor.RouteValues["controller"];
            var moduloId = await _usuarioService.ObtenerModuloIdPorNombre(moduloNombre);
            _logger.LogInformation($"Nombre del módulo: {moduloNombre}, ID obtenido: {moduloId}");

            // Obtener el rolId desde el claim "RoleId"
            var rolClaim = user.FindFirst("RoleId");
            var rolId = rolClaim != null && int.TryParse(rolClaim.Value, out var parsedRolId) ? parsedRolId : 0;
            _logger.LogInformation($"Rol ID obtenido: {rolId}");

            // Obtener el permiso específico para el rol y el módulo
            var permisoModulo = await _usuarioService.ObtenerPermisoPorRolYModulo(rolId, moduloId);
            _logger.LogInformation($"Permisos obtenidos para rol {rolId} y módulo {moduloId}: {JsonConvert.SerializeObject(permisoModulo)}");

            if (permisoModulo == null)
            {
                _logger.LogInformation("No hay permisos asociados para el rol y módulo.");
                context.Result = new ContentResult { Content = "Acceso denegado. No tiene permisos asociados." };
                return;
            }

            // Obtener el nombre del método (acción)
            var metodoNombre = context.ActionDescriptor.RouteValues["action"];
            _logger.LogInformation($"Nombre de la acción obtenida: {metodoNombre}");

            // Verificar el permiso correspondiente al método
            var permisoPropiedad = permisoModulo.GetType().GetProperty(metodoNombre, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

            if (permisoPropiedad != null && permisoPropiedad.PropertyType == typeof(bool))
            {
                var tienePermiso = (bool)permisoPropiedad.GetValue(permisoModulo);

                if (!tienePermiso)
                {
                    _logger.LogInformation($"Acceso denegado. No tiene permiso de {metodoNombre}.");
                    context.Result = new ContentResult { Content = $"Acceso denegado. No tiene permiso de {metodoNombre}." };
                    return;
                }
            }
            else
            {
                _logger.LogInformation("Permiso no configurado para la acción.");
                context.Result = new ContentResult { Content = "Acceso denegado. Permiso no configurado para la acción." };
                return;
            }

            // Continuar con la ejecución si todo está en orden
            _logger.LogInformation("Permiso concedido. Continuando con la acción.");
            await next();
        }
    }
}
