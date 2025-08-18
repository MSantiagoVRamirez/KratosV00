using System.ComponentModel.DataAnnotations.Schema;

namespace Kratos.Server.Models.Ventas
{
    public class POS
    {
        public int id { get; set; }

        [ForeignKey("Venta")]
        public int ventaId { get; set; }
        public Venta? VentaPOSFk { get; set; }

        [ForeignKey("Producto")]
        public int productoId { get; set; } 
        public Producto? ProductoPOSFk { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal precioUnitario { get; set; }

        public int cantidad { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal porcentajeInpuesto { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal porcentajeDescuento { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal subTotal { get; set; }
    }
}
