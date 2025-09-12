using System.ComponentModel.DataAnnotations.Schema;

namespace Kratos.Server.Models.Ventas
{
    public class RecepcionDetalle
    {
        public int id { get; set; }

        [ForeignKey("Recepcion")]
        public int recepcionId { get; set; }
        public Recepcion? recepcionFk { get; set; }

        [ForeignKey("Pedido")]
        public int pedidoId { get; set; }
        public Pedido? pedidoFk { get; set; }

        public bool completo { get; set; }
    }
}

