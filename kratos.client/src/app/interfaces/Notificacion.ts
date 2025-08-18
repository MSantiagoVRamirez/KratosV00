export interface Notificacion {
    id: number,
    usuarioId: number,
    fecha: string,
    contenido: string,
    moduloId: number,
    estado: boolean,
    rolId: number
}