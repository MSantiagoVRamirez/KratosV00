export interface TareaPDT {
    id: number;
    nombre: string;
    fechaInicio: string;
    duracion: number;
    fechaFin: string | null;
    avanceActual: number | null;
    avanceReal: number | null;
    odsId: number;
    tallerId: number | null;
    hitoPagoId: number | null;
    tareaPadreId: number | null;
}