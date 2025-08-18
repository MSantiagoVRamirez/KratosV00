using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Kratos.Server.Models.Ventas
{
    public class Impuesto
    {
        public int id { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [ForeignKey("TratamientoEmpresa")]
        public int tratamientoId { get; set; }
        public TratamientoEmpresa? tratamientoImpuestoFk { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string nombre { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string descripcion { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string codigo { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string porcentaje { get; set; }
    }
}
