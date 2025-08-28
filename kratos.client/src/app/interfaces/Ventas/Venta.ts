export enum TipoVenta {
  Contado = 0,
  Credito = 1,
  Mixto = 2,
}

export enum TipoPago {
  Efectivo = 0,
  TarjetaCredito = 1,
  TarjetaDebito = 2,
  TransferenciaBancaria = 3,
  Otro = 4,
}

export enum EstadoVenta {
  Pendiente = 0,
  Finalizada = 1,
  Pagada = 2,
  Cancelada = 3,
  Reembolsada = 4,
  PorCobrar = 5,
}

export interface Venta {
  id: number
  puntoVentaId: number
  clienteId?: number | null
  vendedorId?: number | null
  fecha?: string
  numeroFactura?: string | null
  total: number
  tipoVenta: TipoVenta
  tipoPago: TipoPago
  estado: EstadoVenta
  activo?: boolean
  estaCancelada?: boolean
}

