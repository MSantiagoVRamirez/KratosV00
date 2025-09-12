export interface CatalogoItemCarrusel {
  id: number
  empresaId: number
  titulo?: string | null
  descripcion?: string | null
  tituloColor?: string | null
  imagenUrl?: string | null
  orden: number
  intervaloMs?: number
  seccion?: 'productos' | 'servicios'
  activo: boolean
  creadoEn?: string
  actualizadoEn?: string | null
}

export interface CatalogoProductoConfig {
  productoId: number
  codigo?: string
  nombre?: string
  descripcion?: string
  precio?: number
  visible: boolean
  tituloPersonalizado?: string | null
  descripcionPersonalizada?: string | null
  palabrasClave?: string | null
}
