export interface Hallazgo {
  id: number
  nombre: string
  recomendacion: string
  tallerId: number
  disciplinaId: number
  tipoCategoria: number
  responsableAccionId: number
  descripcionAccionCierre: string | null
  fechaCierrePlaneada: string
  fechaCierreReal: string | null
  documento: string | null
  originadorBrechasId: number
  ultimoComentarioVerificacionCierre: string | null
  estado: number  // 0: Pendiente, 1: EnProceso, 2: Completado, 3: EnProcesoVerificacion, 4. Cancelado, 5, Rechazado, 6. FaltaFirma
  estaAprobado: boolean
  estaCancelado: boolean
  estaRechazado: boolean
  estaFirmado: boolean
  comentarioAprobacion: string | null
  nombreFirma: string | null
  fechaFirma: string | null
}
