export interface Oferta {
  id: number
  productoId: number
  empresaId: number
  fechaInicio: string // ISO date string
  fechaFin: string // ISO date string
  porcentajeDescuento: number
  activo: boolean
  creadoEn?: string
  actualizadoEn?: string | null

  // opcionales recibidos del API enriquecido
  productoNombre?: string | null
}

