export interface POSItem {
  id: number
  ventaId: number
  productoId: number
  productoNombre?: string | null
  productoCodigo?: string | null
  precioUnitario: number
  cantidad: number
  porcentajeInpuesto: number
  porcentajeDescuento: number
  subTotal: number
}

