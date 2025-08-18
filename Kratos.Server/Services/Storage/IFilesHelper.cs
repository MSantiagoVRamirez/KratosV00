namespace Kratos.Server.Services.Storage
{
    public interface IFilesHelper
    {
        Task<string> SubirArchivo(Stream archivo, string nombre);
    }
}
