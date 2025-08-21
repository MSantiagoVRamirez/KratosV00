using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Categoria
{
    public int Id { get; set; }

    [ForeignKey("Categoria")]
    public int? categoriapadreId { get; set; }
    public Categoria? categoriapadreFk { get; set; }

    [Required(ErrorMessage = "El nombre es obligatorio")]
    [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
    public string Nombre { get; set; }

    [Required(ErrorMessage = "La descripción es obligatoria")]
    [MaxLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
    public string Descripcion { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime CreadoEn { get; set; } = DateTime.Now;
    public DateTime ActualizadoEn { get; set; } = DateTime.Now;
}