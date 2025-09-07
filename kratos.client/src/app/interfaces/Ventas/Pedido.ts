export interface PedidoItem {
  id: number
  compraId: number
  productoId: number
  productoNombre?: string | null
  productoCodigo?: string | null
  precioUnitario: number
  cantidad: number
  porcentajeInpuesto: number
  porcentajeDescuento: number
  subTotal: number
}

