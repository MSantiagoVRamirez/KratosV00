using DinkToPdf;
using DinkToPdf.Contracts;
using Kratos.Server.Models.Contexto;
using Microsoft.EntityFrameworkCore;
using System.Text;

public class PdfService 
{
    private readonly KratosContext _context;
    private readonly IConverter _converter;

    public PdfService(KratosContext context, IConverter converter)
    {
        _context = context;
        _converter = converter;
    }

    public async Task<byte[]> GenerateCategoriasReport()
    {
        var categorias = await _context.Categoria
            .Include(c => c.categoriapadreFk)
            .ToListAsync();

        var html = new StringBuilder();
        html.Append("<h1 style='text-align:center'>Reporte de Categorías</h1>");
        html.Append("<table border='1' style='width:100%;border-collapse:collapse'>");
        html.Append("<tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Categoría Padre</th><th>Estado</th></tr>");

        foreach (var cat in categorias)
        {
            html.Append($"<tr><td>{cat.Id}</td><td>{cat.Nombre}</td><td>{cat.Descripcion}</td><td>{cat.categoriapadreFk?.Nombre ?? "Ninguna"}</td><td>{(cat.Activo ? "Activo" : "Inactivo")}</td></tr>");
        }

        html.Append("</table>");

        var doc = new HtmlToPdfDocument()
        {
            GlobalSettings = {
                ColorMode = ColorMode.Color,
                Orientation = Orientation.Portrait,
                PaperSize = PaperKind.A4,
                Margins = new MarginSettings { Top = 10, Bottom = 10, Left = 10, Right = 10 }
            },
            Objects = {
                new ObjectSettings {
                    HtmlContent = html.ToString(),
                    WebSettings = { DefaultEncoding = "utf-8" }
                }
            }
        };

        return _converter.Convert(doc);
    }
}