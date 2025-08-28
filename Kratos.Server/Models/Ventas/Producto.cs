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
        [ForeignKey("Categorias")]
        public int subCategoriaId { get; set; }
        public Categoria? subCategoriaFk { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal precio { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal costo { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        public int stockMinimo { get; set; }
 

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        public bool activo { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime creadoEn { get; set; } = DateTime.Now;

        [DataType(DataType.DateTime)]
        public DateTime actualizadoEn { get; set; } = DateTime.Now;
        public string? ImagenUrl { get; set; } // Ruta relativa de la imagen

        [NotMapped] // evita que EF la mapee a la BD
        public IFormFile? ImagenArchivo { get; set; }

        public bool productoServicio { get; set; }
    }
}