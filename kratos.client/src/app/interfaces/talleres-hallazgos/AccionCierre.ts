export interface AccionCierre {
  id: number
  hallazgoId: number
  fechaEnvioAccion: string
  comentarioResponsableAccion: string
  documentoResponsableAccion: string | null
  fechaEnvioVerificacion: string | null
  estaVerificado: boolean
  comentarioResponsableVerificacion: string | null
  enlace: string | null
}
