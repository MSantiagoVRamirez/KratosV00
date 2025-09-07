export enum TipoCompra {
  Contado = 0,
  Credito = 1,
  Mixto = 2,
}

export enum TipoPagoCompra {
  Efectivo = 0,
  TarjetaCredito = 1,
  TarjetaDebito = 2,
  TransferenciaBancaria = 3,
  Otro = 4,
}

export enum EstadoCompra {
  Pendiente = 0,
  Finalizada = 1,
  Pagada = 2,
  Cancelada = 3,
  Reembolsada = 4,
  PorCobrar = 5,
}

export interface Compra {
  id: number
  puntoVentaId: number
  proveedorId?: number | null
  solicitanteId?: number | null
  fecha?: string
  numeroFactura?: string | null
  total: number
  tipoCompra: TipoCompra
  tipoPago: TipoPagoCompra
  estado: EstadoCompra
  activo?: boolean
  estaCancelada?: boolean
}

