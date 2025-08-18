using System.ComponentModel.DataAnnotations;

namespace Kratos.Server.Models.Seguridad
{
    public class Modulo
    {
        public int id { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string nombre { get; set; }
    }
}
