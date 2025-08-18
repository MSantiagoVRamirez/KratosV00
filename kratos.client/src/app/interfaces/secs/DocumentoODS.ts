export interface DocumentoODS {
  id: number
  odsId: number
  fecha: string
  informeSemanalPlaneado: number
  informeSemanalReal: number
  informeMensualPlaneado: number
  informeMensualReal: number
  informeEstimadoPlaneado: number
  informeEstimadoReal: number
  informeHSEEstadísticoPlaneado: number
  informeHSEEstadísticoReal: number
  informeHSEGestionPlaneado: number
  informeHSEGestionReal: number
  actaInicioPlaneado: number
  actaInicioReal : number
  actaOCPlaneado : number
  actaOCReal : number
  actaSuspensionReinicioPaneado: number
  actaSuspensionReinicioRea: number
  actaTerminacionPlaneado: number
  actaTerminacionReal: number
  actaBalanceCierrePlaneado: number
  actaBalanceCierreReal: number
  totalPlaneado: number
  totalReal: number
}