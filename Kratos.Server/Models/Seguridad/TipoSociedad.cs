using System.ComponentModel.DataAnnotations;

namespace Kratos.Server.Models.Seguridad
{
    public class TipoSociedad
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string codigo { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string nombre { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(500, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string descripcion { get; set; }
    }
}
