export interface HitoPago {
  id: number
  odsId: number
  numero: string
  descripcion: string
  porcentaje: number
  valor: number | null
  pagado: boolean
  estado: number | null  // 0: Pendiente, 1: EnProceso, 2: Completado, 3: Cancelado, 4. Rechazado
  estaCancelado: boolean
  estaAprobado: boolean
  estaRechazado: boolean
  comentarioAprobacion: string | null
  cumplimiento: boolean
  fechaEjecutado: string | null
  fechaProgramadaTardia: string | null
}