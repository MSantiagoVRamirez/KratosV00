export interface Categoria {
    id: number,
    categoriapadreId: number | null,
    Nombre: string,
    Descripcion: string,
    Activo: boolean,
    CreadoEn: string,
    ActualizadoEn: string     
}