export interface TipoActa {
  id: number
  odsId: number
  nombre: string
  descripcion: string
  frecuencia: number  // 0: AlInicio, 1: AlCierre, 2: AlSuspender, 3: Semanal, 4: Mensual, 5: Quincenal, 6: Diario, 7: Anual, 8: Ocasional
  fecha: string
  hora: string
  numeroPlaneado: number
  numeroReal: number
}