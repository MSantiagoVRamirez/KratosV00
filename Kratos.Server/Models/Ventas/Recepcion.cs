using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Kratos.Server.Models.Seguridad;

namespace Kratos.Server.Models.Ventas
{
    public class Recepcion
    {
        public int id { get; set; }

        [ForeignKey("Compra")]
        public int compraId { get; set; }
        public Compra? compraFk { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime fechaHora { get; set; } = DateTime.Now;

        [MaxLength(200)]
        public string? entregadoPor { get; set; }

        [ForeignKey("Usuario")]
        public int? usuarioId { get; set; }
        public Usuario? usuarioFk { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime creadoEn { get; set; } = DateTime.Now;
    }
}

