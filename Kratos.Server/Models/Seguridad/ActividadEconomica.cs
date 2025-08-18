using System.ComponentModel.DataAnnotations;

namespace Kratos.Server.Models.Seguridad
{
    public class ActividadEconomica
    {
        public int id { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        public string codigoCiiu { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        public string nombre { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        public string descripcion { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        public string categoria { get; set; }
    }
}
