export interface Contrato {
  id: number
  numero: string
  numeroSeguimientoCenit: string | null
  numeroSeguimientoContratista: string | null
  objeto: string
  empresaId: number
  originadorId: number  // Usuario actual
  adminContratoId: number
  jefeIngenieriaId: number  // Juan Diego
  fechaInicio: string
  fechaFin: string
  fechaFinalOriginal: string
  portafolio: number
  valorCostoDirecto: number
  valorInicialCostoDirecto: number
  valorGastosReembolsables: number
  valorInicialGastosReembolsables: number
  valorComprometido: number | null
  valorPagado: number | null
  valorFaltaPorPagar: number | null
  numeroOdsSuscritas: number | null
  valorDisponible: number | null
  valorDisponibleGastosReembolsables: number | null
  estado: number  // 0: Pendiente, 1: EnProceso, 2: Rechazado, 3: Completado, 4: Suspendido
  estaAprobado: boolean
  estaRechazado: boolean
  estaSuspendido: boolean
  comentarioAprobacion: string | null
}
