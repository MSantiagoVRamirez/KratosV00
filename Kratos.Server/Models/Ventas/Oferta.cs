using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kratos.Server.Models.Ventas
{
    public class Oferta
    {
        [Key]
        public int id { get; set; }

        [Required]
        [ForeignKey("Productos")]
        public int productoId { get; set; }
        public Producto? productoFk { get; set; }

        [Required]
        public int empresaId { get; set; }
        // FK hacia Empresa (modelo está en Seguridad sin namespace explícito)
        public Empresa? ofertaEmpresaFk { get; set; }

        [Required]
        public DateTime fechaInicio { get; set; }

        [Required]
        public DateTime fechaFin { get; set; }

        [Range(0, 100)]
        [Column(TypeName = "decimal(18,2)")]
        public decimal porcentajeDescuento { get; set; }

        public bool activo { get; set; } = true;

        public DateTime creadoEn { get; set; } = DateTime.Now;
        public DateTime? actualizadoEn { get; set; }
    }
}
