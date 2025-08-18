export interface ISubODSFormData {
  step1: {
    nombre: string
    odsId: number | null
    especialidad: number | null
    tipoODS: number
    recurso: number | null
    conexoObra: boolean
  }
  step2: {
    descripcion: string
    fechaInicio: string
    fechaFin: string
    plazoEnDias: number | null
    listaPlanta: string | null
    listaSistema: string | null
  }
  step3: {
    valorHH: number
    valorViaje: number
    valorEstudio: number
    valorGastoReembolsable: number
  }
}

export const defaultSubODSFormData: ISubODSFormData = {
  step1: {
    nombre: '',
    odsId: null,
    especialidad: null,
    tipoODS: 2,
    recurso: null,
    conexoObra: false
  },
  step2: {
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    plazoEnDias: null,
    listaPlanta: null,
    listaSistema: null
  },
  step3: {
    valorHH: 0,
    valorViaje: 0,
    valorEstudio: 0,
    valorGastoReembolsable: 0
  }
} 