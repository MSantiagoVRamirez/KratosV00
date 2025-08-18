using Kratos.Server.Models.Seguridad;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
public class Empresa
{
    public int id { get; set; }

    [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
    [DataType(DataType.Password)]
    public string? contraseña { get; set; }

    [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
    [DataType(DataType.Password)]
    [Compare("contraseña", ErrorMessage = "Las contraseñas no coinciden")]
    public string? confirmarContraseña { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio")]
    [ForeignKey("TipoSociedad")]
    public int tiposociedadId { get; set; }
    public TipoSociedad? empresasociedadFk { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio")]
    [ForeignKey("ActividadEconomicas")]
    public int actividadId { get; set; }
    public ActividadEconomica? empresaactividadFk { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio")]
    [ForeignKey("RegimenTributario")]
    public int regimenId { get; set; }
    public RegimenTributario? empresaregimenFk { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio")]
    [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
    public string token { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio")]
    [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
    public string razonSocial { get; set; }

    [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
    public string? nombreComercial { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio")]
    [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
    public string nit { get; set; }

    [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
    public string? dv { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio")]
    [DataType(DataType.PhoneNumber)]
    public string telefono { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio")]
    [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
    [DataType(DataType.EmailAddress)]
    public string email { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio")]
    [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
    public string representanteLegal { get; set; }

    public bool activo { get; set; }

    [DataType(DataType.Date)]
    public DateTime? creadoEn { get; set; }

    [DataType(DataType.Date)]
    public DateTime? actualizadoEn { get; set; }
}