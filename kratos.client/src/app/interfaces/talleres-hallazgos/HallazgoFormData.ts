export interface IHallazgoFormData {
  step1: {
    tallerId: number
    disciplinaId: number
    tipoCategoria: number | null
  }
  step2: {
    responsableAccionId: number
    originadorBrechasId: number
  }
  step3: {
    fechaCierrePlaneada: string
    fechaCierreReal: string | null
    documento: string | null
  }
  step4: {
    recomendacion: string
    descripcionAccionCierre: string | null
    ultimoComentarioVerificacionCierre: string | null
  }
}

export const defaultHallazgoFormData: IHallazgoFormData = {
  step1: {
    tallerId: 0,
    disciplinaId: 0,
    tipoCategoria: null
  },
  step2: {
    responsableAccionId: 0,
    originadorBrechasId: 0
  },
  step3: {
    fechaCierrePlaneada: '',
    fechaCierreReal: null,
    documento: null
  },
  step4: {
    recomendacion: '',
    descripcionAccionCierre: null,
    ultimoComentarioVerificacionCierre: null
  }
} 