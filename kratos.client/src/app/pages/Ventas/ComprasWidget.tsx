import React, { useEffect, useMemo, useState } from 'react'
import '../../Styles/estilos.css'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import CompraService from '../../services/Ventas/CompraService'
import PedidoService from '../../services/Ventas/PedidoService'
import { Compra, EstadoCompra, TipoCompra, TipoPagoCompra } from '../../interfaces/Ventas/Compra'
import { PedidoItem } from '../../interfaces/Ventas/Pedido'
import { ModalDialog } from '../components/ModalDialog'

type CompraRow = Compra & {
  puntoVentaNombre?: string | null
  proveedorNombre?: string | null
  solicitanteNombre?: string | null
}

const formatDate = (iso?: string) => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

const getEstadoCompraText = (estado: number) => {
  switch (estado) {
    case EstadoCompra.Pendiente: return 'Pendiente'
    case EstadoCompra.Finalizada: return 'Finalizada'
    case EstadoCompra.Pagada: return 'Pagada'
    case EstadoCompra.Cancelada: return 'Cancelada'
    case EstadoCompra.Reembolsada: return 'Reembolsada'
    case EstadoCompra.PorCobrar: return 'Por Cobrar'
    default: return 'Desconocido'
  }
}

const getTipoCompraText = (t: number) => {
  switch (t) {
    case TipoCompra.Contado: return 'Contado'
    case TipoCompra.Credito: return 'Crédito'
    case TipoCompra.Mixto: return 'Mixto'
    default: return 'Desconocido'
  }
}

const getTipoPagoText = (t: number) => {
  switch (t) {
    case TipoPagoCompra.Efectivo: return 'Efectivo'
    case TipoPagoCompra.TarjetaCredito: return 'Tarjeta Crédito'
    case TipoPagoCompra.TarjetaDebito: return 'Tarjeta Débito'
    case TipoPagoCompra.TransferenciaBancaria: return 'Transferencia'
    case TipoPagoCompra.Otro: return 'Otro'
    default: return 'Desconocido'
  }
}

const ComprasWidget: React.FC = () => {
  const [rows, setRows] = useState<CompraRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const [pedidoModal, setPedidoModal] = useState(false)
  const [pedidoLoading, setPedidoLoading] = useState(false)
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([])
  const [compraSeleccionada, setCompraSeleccionada] = useState<CompraRow | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await CompraService.leer()
      setRows(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e?.response?.data || 'Error cargando compras')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(r =>
      String(r.id).includes(q) ||
      (r.numeroFactura || '').toLowerCase().includes(q) ||
      (r.puntoVentaNombre || '').toLowerCase().includes(q) ||
      (r.proveedorNombre || '').toLowerCase().includes(q) ||
      (r.solicitanteNombre || '').toLowerCase().includes(q)
    )
  }, [rows, search])

  const abrirDetalles = async (compra: CompraRow) => {
    setCompraSeleccionada(compra)
    setPedidoItems([])
    setPedidoLoading(true)
    try {
      const { data } = await PedidoService.leerPorCompra(compra.id)
      setPedidoItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setPedidoItems([])
    } finally {
      setPedidoLoading(false)
      setPedidoModal(true)
    }
  }

  const columns: GridColDef<CompraRow>[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'fecha', headerName: 'Fecha', minWidth: 180, flex: 0.9,
      renderCell: (params) => <span>{formatDate(params.row.fecha)}</span> },
    { field: 'numeroFactura', headerName: 'Factura', minWidth: 120, flex: 0.6 },
    { field: 'puntoVentaNombre', headerName: 'Punto de Venta', minWidth: 160, flex: 1 },
    { field: 'proveedorNombre', headerName: 'Proveedor', minWidth: 160, flex: 1 },
    { field: 'solicitanteNombre', headerName: 'Solicitante', minWidth: 160, flex: 1 },
    { field: 'tipoCompra', headerName: 'Tipo Compra', minWidth: 130, flex: 0.7,
      renderCell: (params) => <span>{getTipoCompraText(Number(params.row.tipoCompra))}</span> },
    { field: 'tipoPago', headerName: 'Pago', minWidth: 150, flex: 0.8,
      renderCell: (params) => <span>{getTipoPagoText(Number(params.row.tipoPago))}</span> },
    { field: 'estado', headerName: 'Estado', minWidth: 140, flex: 0.8,
      renderCell: (params) => <span>{getEstadoCompraText(Number(params.row.estado))}</span> },
    { field: 'total', headerName: 'Total', minWidth: 120, flex: 0.6, type: 'number' },
    { field: 'acciones', headerName: 'Detalles', minWidth: 130, flex: 0.5, sortable: false,
      renderCell: (params) => (
        <button className='btn btn-sm btn-primary' onClick={() => abrirDetalles(params.row)}>Detalles</button>
      )
    },
  ]

  return (
    <>
      <div className='contenido'>
        <div id='compras' className='bloque-formulario'>
          <div><h2>Compras</h2></div>

          <div className='bloque-botones' style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', margin: '0 1rem' }}>
            <input
              className='form-control'
              style={{ maxWidth: 320 }}
              placeholder='Buscar por id, factura, punto, proveedor o solicitante'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className='boton-formulario' onClick={load} disabled={loading}>
              {loading ? 'Actualizando...' : 'Refrescar'}
            </button>
          </div>

          {error && <div className='alert alert-danger m-4'>{error}</div>}

          <div style={{ height: '70%', width: '96%', margin: '1rem' }}>
            <DataGrid
              rows={filtered}
              columns={columns}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25, 50]}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {pedidoModal && (
        <ModalDialog
          title={`Detalles de Compra #${compraSeleccionada?.id ?? ''}`}
          textBtn='Cerrar'
          onConfirm={() => setPedidoModal(false)}
          closeModal={() => setPedidoModal(false)}
          content={
            <div className='pos-details-modal' style={{ width: '100%', maxHeight: '70vh', overflowY: 'auto' }}>
              {pedidoLoading && <div className='alert alert-info'>Cargando detalles...</div>}
              {!pedidoLoading && pedidoItems.length === 0 && (
                <div className='alert alert-warning'>Sin ítems de pedido para esta compra.</div>
              )}
              {!pedidoLoading && pedidoItems.length > 0 && (
                <div className='pos-items-grid'>
                  {pedidoItems.map((l) => (
                    <div key={l.id} className='pos-item-card'>
                      <div className='pos-item-header'>
                        <div>
                          <div className='pos-item-title'>{l.productoNombre || ''}</div>
                          <div className='pos-item-sub'>Código: {l.productoCodigo || ''}</div>
                        </div>
                      </div>
                      <div className='pos-item-body'>
                        <div className='pos-item-row'>
                          <span>Precio</span><span>${Number(l.precioUnitario).toFixed(2)}</span>
                        </div>
                        <div className='pos-item-row'>
                          <span>Cantidad</span><span>{l.cantidad}</span>
                        </div>
                        <div className='pos-item-row'>
                          <span>Desc.</span><span>{Number(l.porcentajeDescuento).toFixed(2)}%</span>
                        </div>
                        <div className='pos-item-row'>
                          <span>IVA</span><span>{Number(l.porcentajeInpuesto).toFixed(2)}%</span>
                        </div>
                        <div className='pos-item-row total'>
                          <span>Subtotal</span><span>${Number(l.subTotal).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          }
        />
      )}
    </>
  )
}

export { ComprasWidget }

