using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Kratos.Server.Models.Ventas
{
    public class Inventario
    {
        public int id { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [ForeignKey("Productos")]
        public int productoId { get; set; }
        public Producto? productoFk { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [ForeignKey("PuntoVentas")]
        public int puntoventaId { get; set; }
        public PuntoVenta? puntoventaFk { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        public int cantidad { get; set; }


        [DataType(DataType.DateTime)]
        public DateTime creadoEn { get; set; }


        [DataType(DataType.DateTime)]
        public DateTime actualizadoEn { get; set; }
    }
}
