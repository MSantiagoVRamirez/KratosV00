export interface IContratoFormData {
  step1: {
    numero: string
    numeroSeguimientoCenit: string | null
    numeroSeguimientoContratista: string | null
    objeto: string
    portafolio: number
  }
  step2: {
    empresaId: number
    originadorId: number
    adminContratoId: number
    jefeIngenieriaId: number
  }
  step3: {
    fechaInicio: string
    fechaFin: string
  }
  step4: {
    valorCostoDirecto: number
    valorGastosReembolsables: number
  }
}

export const defaultContratoFormData: IContratoFormData = {
  step1: {
    numero: '',
    numeroSeguimientoCenit: null,
    numeroSeguimientoContratista: null,
    objeto: '',
    portafolio: 0
  },
  step2: {
    empresaId: 0,
    originadorId: 0,
    adminContratoId: 0,
    jefeIngenieriaId: 7
  },
  step3: {
    fechaInicio: '',
    fechaFin: ''
  },
  step4: {
    valorCostoDirecto: 0,
    valorGastosReembolsables: 0
  }
} 