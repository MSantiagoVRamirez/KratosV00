import React, { useEffect, useMemo, useState } from 'react'
import '../../Styles/estilos.css'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import VentaService from '../../services/Ventas/VentaService'
import { Venta } from '../../interfaces/Ventas/Venta'
import POSService from '../../services/Ventas/POSService'
import { POSItem } from '../../interfaces/Ventas/POS'
import { ModalDialog } from '../components/ModalDialog'

type VentaRow = Venta & {
  puntoVentaNombre?: string | null
  clienteNombre?: string | null
  vendedorNombre?: string | null
}

const formatDate = (iso?: string) => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

// Helpers simples, estilo ContratoDetails
const getEstadoVentaText = (estado: number) => {
  switch (estado) {
    case 0: return 'Pendiente'
    case 1: return 'Finalizada'
    case 2: return 'Pagada'
    case 3: return 'Cancelada'
    case 4: return 'Reembolsada'
    case 5: return 'Por Cobrar'
    default: return 'Desconocido'
  }
}
const getTipoVentaText = (t: number) => {
  switch (t) {
    case 0: return 'Contado'
    case 1: return 'Crédito'
    case 2: return 'Mixto'
    default: return 'Desconocido'
  }
}
const getTipoPagoText = (t: number) => {
  switch (t) {
    case 0: return 'Efectivo'
    case 1: return 'Tarjeta Crédito'
    case 2: return 'Tarjeta Débito'
    case 3: return 'Transferencia'
    case 4: return 'Otro'
    default: return 'Desconocido'
  }
}

const VentasWidget: React.FC = () => {
  const [rows, setRows] = useState<VentaRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [posModal, setPosModal] = useState(false)
  const [posLoading, setPosLoading] = useState(false)
  const [posItems, setPosItems] = useState<POSItem[]>([])
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaRow | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await VentaService.leer()
      setRows(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e?.response?.data || 'Error cargando ventas')
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
      (r.clienteNombre || '').toLowerCase().includes(q) ||
      (r.vendedorNombre || '').toLowerCase().includes(q)
    )
  }, [rows, search])

  const abrirDetalles = async (venta: VentaRow) => {
    setVentaSeleccionada(venta)
    setPosItems([])
    setPosLoading(true)
    try {
      const { data } = await POSService.leerPorVenta(venta.id)
      setPosItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setPosItems([])
    } finally {
      setPosLoading(false)
      setPosModal(true)
    }
  }

  const columns: GridColDef<VentaRow>[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    {
      field: 'fecha', headerName: 'Fecha', minWidth: 180, flex: 0.9,
      renderCell: (params) => <span>{formatDate(params.row.fecha)}</span>
    },
    { field: 'numeroFactura', headerName: 'Factura', minWidth: 120, flex: 0.6 },
    { field: 'puntoVentaNombre', headerName: 'Punto de Venta', minWidth: 160, flex: 1 },
    { field: 'clienteNombre', headerName: 'Cliente', minWidth: 160, flex: 1 },
    { field: 'vendedorNombre', headerName: 'Vendedor', minWidth: 160, flex: 1 },
    { field: 'tipoVenta', headerName: 'Tipo Venta', minWidth: 130, flex: 0.7,
      renderCell: (params) => <span>{getTipoVentaText(Number(params.row.tipoVenta))}</span>,
    },
    { field: 'tipoPago', headerName: 'Pago', minWidth: 150, flex: 0.8,
      renderCell: (params) => <span>{getTipoPagoText(Number(params.row.tipoPago))}</span>,
    },
    { field: 'estado', headerName: 'Estado', minWidth: 140, flex: 0.8,
      renderCell: (params) => <span>{getEstadoVentaText(Number(params.row.estado))}</span>,
    },
    { field: 'total', headerName: 'Total', minWidth: 120, flex: 0.6, type: 'number' },
    { field: 'acciones', headerName: 'Detalles', minWidth: 130, flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <button className='btn btn-sm btn-primary' onClick={() => abrirDetalles(params.row)}>
          Detalles
        </button>
      )
    },
  ]

  return (
    <>
    <div className='contenido'>
      <div id='ventas' className='bloque-formulario'>
        <div><h2>Ventas</h2></div>

        <div className='bloque-botones' style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', margin: '0 1rem' }}>
          <input
            className='form-control'
            style={{ maxWidth: 320 }}
            placeholder='Buscar por id, factura, punto, cliente o vendedor'
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
            sx={{
              background: 'linear-gradient(45deg, rgba(10, 70, 120, 0.7), rgba(21, 154, 230, 0.7))',
              borderRadius: '10px',
              color: '#fff',
              '& .MuiDataGrid-columnHeaders': { borderBottom: '1px solid rgba(255, 255, 255, 0.2)' },
              '& .MuiDataGrid-columnHeader': { backgroundColor: 'rgb(20, 111, 165)', color: '#fff', fontWeight: 'bold' },
              '& .MuiDataGrid-cell': { backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '0.95rem', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' },
              '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
              '& .MuiDataGrid-footerContainer': { backgroundColor: 'rgba(0, 0, 0, 0.2)', color: '#fff', borderTop: '1px solid rgba(255, 255, 255, 0.2)' },
              '& .MuiSvgIcon-root': { color: '#fff' },
              '& .MuiTablePagination-root': { color: '#fff' },
            }}
          />
        </div>
      </div>
    </div>
    {posModal && (
      <ModalDialog
        title={`Detalles de Venta #${ventaSeleccionada?.id ?? ''}`}
        textBtn='Cerrar'
        onConfirm={() => setPosModal(false)}
        closeModal={() => setPosModal(false)}
        content={
          <div className='pos-details-modal' style={{ width: '100%', maxHeight: '70vh', overflowY: 'auto' }}>
            {posLoading && <div className='alert alert-info'>Cargando detalles...</div>}
            {!posLoading && posItems.length === 0 && (
              <div className='alert alert-warning'>Sin registros POS para esta venta.</div>
            )}
            {!posLoading && posItems.length > 0 && (
              <div className='pos-items-grid'>
                {posItems.map((l) => (
                  <div key={l.id} className='pos-item-card'>
                    <div className='pos-item-header'>
                      <div>
                        <div className='pos-item-title'>{l.productoNombre || '—'}</div>
                        <div className='pos-item-sub'>Código: {l.productoCodigo || '—'}</div>
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

export { VentasWidget }
