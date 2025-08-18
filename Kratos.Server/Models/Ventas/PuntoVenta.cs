using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Kratos.Server.Models.Seguridad;

namespace Kratos.Server.Models.Ventas
{
    public class PuntoVenta
    {
        public int id { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string nombre { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string direccion { get; set; }



        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string telefono { get; set; }



        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [ForeignKey("Usuario")]
        public int responsableId { get; set; }
        public Usuario? usuarioFk { get; set; }



        public bool activo { get; set; }


        [DataType(DataType.DateTime)]
        public DateTime creadoEn { get; set; }


        [DataType(DataType.DateTime)]
        public DateTime actualizadoEn { get; set; }
    }
}
