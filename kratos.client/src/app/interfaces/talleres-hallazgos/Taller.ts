export interface Taller {
  id: number
  nombre: string
  odsId: number
  tipoId: number
  hitoPagoId: number
  fecha: string
  consultorId: number
  proyecto: string
  liderProyecto: string
  ejerciciosPrevios: string | null
  comentarios: string | null
  avanceTipo1: number
  avanceTipo2: number
  avanceTipo3: number
  estado: number  // 0: Pendiente, 1: EnProceso, 2: Completado, 3. Cancelado, 4, Rechazado, 5. FaltaFirma
  estaAprobado: boolean
  estaCancelado: boolean
  estaRechazado: boolean
  estaFirmado: boolean
  comentarioAprobacion: string | null
  nombreFirma: string | null
  fechaFirma: string | null
}
