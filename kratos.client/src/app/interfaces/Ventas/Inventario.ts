export interface Inventario {
  id: number
  productoId: number
  productoNombre?: string | null
  productoCodigo?: string | null
  puntoventaId: number
  puntoventaNombre?: string | null
  cantidad: number
  productoServicio?: boolean
  creadoEn?: string
  actualizadoEn?: string
}
