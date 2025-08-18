using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Kratos.Server.Models.Seguridad;

namespace Kratos.Server.Models.Ventas
{
    public class Venta
    {
        public int id { get; set; }

        [ForeignKey("PuntoVenta")]
        public int puntoVentaId { get; set; }
        public PuntoVenta? puntoVentaVentaFk { get; set; }

        [ForeignKey("Usuario")]
        public int? clienteId { get; set; }
        public Usuario? ClienteVentaFk { get; set; }

        [ForeignKey("Usuario")]
        public int? vendedorId { get; set; }
        public Usuario? vendedorVentaFk { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime fecha { get; set; }

        [MaxLength(150, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string? numeroFactura { get; set; }

        public decimal total { get; set; } = 0;

        public enum TipoVenta
        {
            Contado,
            Credito,
            Mixto
        }
        public TipoVenta tipoVenta { get; set; } = TipoVenta.Contado;

        public enum TipoPago
        {
            Efectivo,
            TarjetaCredito,
            TarjetaDebito,
            TransferenciaBancaria,
            Otro
        }
        public TipoPago tipoPago { get; set; } = TipoPago.Efectivo;

        public enum EstadoVenta
        {
            Pendiente,
            Finalizada,
            Pagada,
            Cancelada,
            Reembolsada,
            PorCobrar
        }
        public EstadoVenta estado { get; set; } = EstadoVenta.Pendiente;

        public bool activo { get; set; } = false;
        public bool estaCancelada { get; set; } = false;
    }
}
