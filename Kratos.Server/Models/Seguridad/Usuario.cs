using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Data;

namespace Kratos.Server.Models.Seguridad
{
    public class Usuario
    {
        public int id { get; set; }


        [ForeignKey("Roles")]
        public int rolesId { get; set; }
        public Rol? usuariosrolesFk { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        [DataType(DataType.Password)]
        public string contraseña { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        [DataType(DataType.Password)]
        public string confirmarContraseña { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string token { get; set; }

        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        [DataType(DataType.EmailAddress)]
        public string email { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string nombres { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        public string apellidos { get; set; }


        [Required(ErrorMessage = "El campo {0} es obligatorio")]
        [MaxLength(100, ErrorMessage = "El campo {0} debe tener máximo {1} caracteres")]
        [DataType(DataType.PhoneNumber)]
        public string telefono { get; set; }


        public bool estado { get; set; }



        [DataType(DataType.DateTime)]
        public DateTime creadoEn { get; set; }



        [DataType(DataType.DateTime)]
        public DateTime actualizadoEn { get; set; }

    }
}
