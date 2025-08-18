using System.ComponentModel.DataAnnotations.Schema;

namespace Kratos.Server.Models.Ventas
{
    public class Pedido
    {
        public int id { get; set; }

        [ForeignKey("Compra")]
        public int compraId { get; set; }
        public Compra? pedidoCompraFk { get; set; }

        [ForeignKey("Producto")]
        public int productoId { get; set; }
        public Producto? productoCompraFk { get; set; }

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
