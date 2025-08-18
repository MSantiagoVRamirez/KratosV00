export interface ODS {
  id: number
  nombre: string  // número de consecutivo
  numeroSeguimientoCenit: string
  numeroSeguimientoContratista: string
  contratoId: number  // ODS
  descripcion: string  // objeto
  valorHH: number
  valorInicialHH: number
  valorViaje: number
  valorInicialViaje: number
  valorEstudio: number
  valorInicialEstudio: number
  valorSumaGlobalFija: number | null
  valorInicialSumaGlobalFija: number | null
  valorGastoReembolsable: number | null
  porcentajeGastoReembolsable: number | null
  valorDisponible: number | null
  valorHabilitado: number | null
  valorPagado: number | null
  valorFaltaPorPagar: number | null
  fechaInicio: string
  fechaFinalOriginal: string
  fechaFin: string | null
  estaAprobada: boolean
  estaCancelada: boolean
  estaSuspendida: boolean
  estaRechazada: boolean
  comentarioAprobacion: string | null
  estado: number  // 0: Pendiente, 1: EnProceso, 2: Completada, 3: Cancelada, 4. Suspendida, 5. Rechazada
  tipoODS: number  // 0: ODSDedicada, 1. ODSAgregada, 2. STI, 3. MOC, 4. TQ, 5. STD, 6. RSPA, 7. ING
  avance: number
  plantaSistema: boolean
  listaPlanta: string | null
  listaSistema: string | null
  conexoObra: boolean | null
  odsId: number | null  // SubODS
  contratista: string | null  // ODS
  coordinadorODSId: number  // SubODS
  supervisorTecnicoId: number | null  // ODS
  liderServicioId: number | null  // SubODS
  SyCcontratistaId: number | null  // ODS
  especialidad: number | null  // SubODS
  recurso: number | null  // SubODS
  areaSupervisionTecnica: number | null  // ODS
  complejidad: number | null  // ODS
  paqueteModular: number | null  // ODS
  fechaRealCierre: string | null  // ODS
  porcentajeRequerimientosCumplidos: number | null  // ODS
  porcentajeAccionesCumplidas: number | null  // ODS
  horasHombre: number | null  // ODS
}
