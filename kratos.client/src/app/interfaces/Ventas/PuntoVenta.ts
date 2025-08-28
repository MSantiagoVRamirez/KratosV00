// interfaces/Ventas/PuntoVenta.ts
export interface PuntoVenta {
  id: number;

  nombre: string;
  direccion: string;
  telefono: string;

  responsableId: number;    // FK a Usuario
  activo: boolean;

  creadoEn?: string;
  actualizadoEn?: string;
  empresaId: number;
}
