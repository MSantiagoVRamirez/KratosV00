using System.ComponentModel.DataAnnotations.Schema;

namespace Kratos.Server.Models.Ventas
{
    public class impuestoProducto
    {
        public int id { get; set; }

        [ForeignKey("impuesto")]
        public int impuestoId { get; set; }
        public Impuesto? impuestoRelacionFk { get; set; }

        [ForeignKey("producto")]
        public int productoId { get; set; }
        public Producto? productoRelacionFk { get; set; }
    }
}
