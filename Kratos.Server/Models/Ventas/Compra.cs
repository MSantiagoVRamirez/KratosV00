using Kratos.Server.Models.Seguridad;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace Kratos.Server.Models.Ventas
{
    public class Compra
    {
        public int id { get; set; }

        [ForeignKey("PuntoVenta")]
        public int puntoVentaId { get; set; }
        public PuntoVenta? puntoVentaVentaFk { get; set; }

        [ForeignKey("Proveedor")]
        public int? proveedorId { get; set; }
        public Proveedor? proveedorCompraFk { get; set; }

        [ForeignKey("Usuario")]
        public int? solicitanteId { get; set; }
        public Usuario? solicitanteCompraFk { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime fecha { get; set; }

        [MaxLength(150, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string? numeroFactura { get; set; }

        public decimal total { get; set; } = 0;

        public enum TipoCompra
        {
            Contado,
            Credito,
            Mixto
        }
        public TipoCompra tipoCompra { get; set; } = TipoCompra.Contado;

        public enum TipoPagoCompra
        {
            Efectivo,
            TarjetaCredito,
            TarjetaDebito,
            TransferenciaBancaria,
            Otro
        }
        public TipoPagoCompra tipoPago { get; set; } = TipoPagoCompra.Efectivo;

        public enum EstadoCompra
        {
            Pendiente,
            Finalizada,
            Pagada,
            Cancelada,
            Reembolsada,
            PorCobrar
        }
        public EstadoCompra estado { get; set; } = EstadoCompra.Pendiente;

        public bool activo { get; set; } = false;
        public bool estaCancelada { get; set; } = false;

        // Indica si la compra ya fue recepcionada (puente Compras -> Inventario)
        public bool recibido { get; set; } = false;
    }
}
