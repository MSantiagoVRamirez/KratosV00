using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kratos.Server.Models.Ventas
{
    public class CatalogoProductoConfig
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int empresaId { get; set; }
        public Empresa? empresaFk { get; set; }

        [Required]
        [ForeignKey("Productos")]
        public int productoId { get; set; }
        public Producto? productoFk { get; set; }

        public bool visible { get; set; } = true;

        [MaxLength(300)]
        public string? tituloPersonalizado { get; set; }

        [MaxLength(1000)]
        public string? descripcionPersonalizada { get; set; }

        [MaxLength(500)]
        public string? palabrasClave { get; set; } // separadas por comas

        public DateTime creadoEn { get; set; } = DateTime.Now;
        public DateTime? actualizadoEn { get; set; }
    }
}

