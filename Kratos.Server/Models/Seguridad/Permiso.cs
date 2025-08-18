using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Reflection;

namespace Kratos.Server.Models.Seguridad
{
    public class Permiso
    {
        public int id { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [ForeignKey("Roles")]
        public int rolesId { get; set; }
        public Rol? permisosrolesId { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [ForeignKey("Modulos")]
        public int modulosId { get; set; }
        public Modulo? permisosmodulosId { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string nombre { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string descripcion { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string codigo { get; set; }
        public bool consultar { get; set; }
        public bool leer { get; set; }
        public bool insertar { get; set; }
        public bool editar { get; set; }
        public bool eliminar { get; set; }
        public bool importar { get; set; }
        public bool exportar { get; set; }
    }
}
