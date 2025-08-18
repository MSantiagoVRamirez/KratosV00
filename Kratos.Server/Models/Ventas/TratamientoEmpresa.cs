using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Kratos.Server.Models.Ventas
{
    public class TratamientoEmpresa
    {
        public int id { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [ForeignKey("Empresas")]
        public int empresaId { get; set; }
        public Empresa? empresaFk { get; set; }

        [ForeignKey("Categoria")]
        public int categoriaProductoId { get; set; }
        public Categoria? categoriaTratamientoFk { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string porcentaje { get; set; }
    }
}
