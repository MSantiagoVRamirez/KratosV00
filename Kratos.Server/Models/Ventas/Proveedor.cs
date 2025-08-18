using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kratos.Server.Models.Ventas
{
    public class Proveedor
    {
        public int id { get; set; }

        [ForeignKey("Empresa")]
        public int empresaId { get; set; }
        public Empresa? proveedorEmpresaFk { get; set; }

        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string nombre { get; set; }

        [DataType(DataType.EmailAddress)]
        public string email { get; set; }

        [DataType(DataType.PhoneNumber)]
        public string telefono { get; set; }

        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string? direccion { get; set; }


    }
}
