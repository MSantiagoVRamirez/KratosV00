export interface IODSFormData {
  step1: {
    numeroSeguimientoCenit: string
    numeroSeguimientoContratista: string
    descripcion: string
    tipoODS: number
    complejidad: number | null
    contratoId: number
    contratista: string
  }
  step2: {
    coordinadorODSId: number | null
    SyCcontratistaId: number | null
    liderServicioId: number | null
    supervisorTecnicoId: number | null
    areaSupervisionTecnica: number | null
    paqueteModular: number | null
  }
  step3: {
    fechaInicio: string
    fechaFin: string
    plazoEnDias: number | null
    conexoObra: boolean
    listaPlanta: string | null
    listaSistema: string | null
  }
  step4: {
    valorHH: number
    valorViaje: number
    valorEstudio: number
    valorGastoReembolsable: number
  }
}

export const defaultODSFormData: IODSFormData = {
  step1: {
    numeroSeguimientoCenit: '',
    numeroSeguimientoContratista: '',
    descripcion: '',
    tipoODS: 0,
    complejidad: null,
    contratoId: 0,
    contratista: ''
  },
  step2: {
    coordinadorODSId: null,
    SyCcontratistaId: null,
    liderServicioId: null,
    supervisorTecnicoId: null,
    areaSupervisionTecnica: null,
    paqueteModular: null
  },
  step3: {
    fechaInicio: '',
    fechaFin: '',
    plazoEnDias: null,
    conexoObra: false,
    listaPlanta: null,
    listaSistema: null
  },
  step4: {
    valorHH: 0,
    valorViaje: 0,
    valorEstudio: 0,
    valorGastoReembolsable: 0
  }
} 