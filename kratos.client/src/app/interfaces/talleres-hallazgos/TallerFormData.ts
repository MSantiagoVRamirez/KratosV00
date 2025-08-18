export interface ITallerFormData {
  step1: {
    fecha: string
    odsId: number
    tipoId: number
  }
  step2: {
    consultorId: number
    proyecto: string
    liderProyecto: string
    hitoPagoId: number
  }
  step3: {
    ejerciciosPrevios: string | null
    comentarios: string | null
  }
}

export const defaultTallerFormData: ITallerFormData = {
  step1: {
    fecha: '',
    odsId: 0,
    tipoId: 0
  },
  step2: {
    consultorId: 0,
    proyecto: '',
    liderProyecto: '',
    hitoPagoId: 0
  },
  step3: {
    ejerciciosPrevios: null,
    comentarios: null
  }
} 