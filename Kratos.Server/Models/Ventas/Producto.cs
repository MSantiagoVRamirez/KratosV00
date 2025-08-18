using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kratos.Server.Models.Ventas
{
    public class Producto
    {
        public int id { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string codigo { get; set; }

        [ForeignKey("Impuesto")]
        public int? impuestoId { get; set; }
        public Impuesto? impuestoFk { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string nombre { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(500, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")] // Aumenté el límite
        public string descripcion { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [ForeignKey("Categorias")]
        public int categoriaId { get; set; }
        public Categoria? categoriaFk { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal precio { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal costo { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        public int stockMinimo { get; set; }

        public string? imagenUrl { get; set; } // Nueva propiedad para imágenes

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        public bool activo { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime creadoEn { get; set; } = DateTime.Now;

        [DataType(DataType.DateTime)]
        public DateTime actualizadoEn { get; set; } = DateTime.Now;
    }
}