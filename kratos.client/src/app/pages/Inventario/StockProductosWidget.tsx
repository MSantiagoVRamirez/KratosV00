import React, {useEffect, useMemo, useState} from 'react'
import InventarioService from '../../services/Ventas/InventarioService'
import { Inventario } from '../../interfaces/Ventas/Inventario'
import { Producto } from '../../interfaces/Ventas/Producto'
import { PuntoVenta } from '../../interfaces/Ventas/PuntoVenta'
import ProductoService from '../../services/Ventas/ProductoService'
import PuntoVentaService from '../../services/Ventas/PuntoVentaService'
import '../../Styles/estilos.css'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { IconButton } from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { ModalDialog } from '../components/ModalDialog'
import { grid2ColStyle } from '../../utils'
import { useFormValidation } from '../../hooks/useFormValidation'

const formatDate = (iso?: string) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch {
    return iso
  }
}

const StockProductosWidget: React.FC = () => {
  const defaultInventario: Inventario = {
    id: 0,
    productoId: 0,
    puntoventaId: 0,
    cantidad: 0,
    productoServicio: false,
  }

  const [items, setItems] = useState<Inventario[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [puntos, setPuntos] = useState<PuntoVenta[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [edited, setEdited] = useState<Inventario>(defaultInventario)
  const [deleteId, setDeleteId] = useState<number>(0)

  const closeModal = () => setModalType(null)

  // Validación del formulario (hooks deben estar en el nivel superior del componente)
  const isFormValid = useFormValidation({
    productoId:   { value: (edited?.productoId ?? 0), required: true, type: 'select' },
    puntoventaId: { value: (edited?.puntoventaId ?? 0), required: true, type: 'select' },
    cantidad:     { value: (edited?.cantidad ?? 0), required: true, type: 'number' },
  })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const {data} = await InventarioService.leer()
      setItems((data as Inventario[]) || [])
    } catch (e: any) {
      setError(e?.response?.data || 'Error cargando inventario')
    } finally {
      setLoading(false)
    }
  }

  const loadProductos = async () => {
    try {
      const { data } = await ProductoService.leer()
      if (Array.isArray(data)) setProductos(data)
    } catch {}
  }

  const loadPuntos = async () => {
    try {
      const { data } = await PuntoVentaService.getAll()
      if (Array.isArray(data)) setPuntos(data)
    } catch {}
  }

  useEffect(() => {
    load()
    loadProductos()
    loadPuntos()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = items.filter(i => i.productoServicio === false)
    if (!q) return base
    return base.filter(i =>
      (i.productoNombre || '').toLowerCase().includes(q) ||
      (i.productoCodigo || '').toLowerCase().includes(q) ||
      (i.puntoventaNombre || '').toLowerCase().includes(q)
    )
  }, [items, search])

  const columns: GridColDef[] = [
    { field: 'productoNombre', headerName: 'Producto', flex: 1, minWidth: 180, renderCell: (p) => <span>{(p.row as Inventario).productoNombre ?? '-'}</span> },
    { field: 'productoCodigo', headerName: 'Código', flex: 0.6, minWidth: 120, renderCell: (p) => <span>{(p.row as Inventario).productoCodigo ?? '-'}</span> },
    { field: 'puntoventaNombre', headerName: 'Punto de Venta', flex: 1, minWidth: 180, renderCell: (p) => <span>{(p.row as Inventario).puntoventaNombre ?? '-'}</span> },
    { field: 'cantidad', headerName: 'Cantidad', type: 'number', align: 'right', headerAlign: 'right', flex: 0.4, minWidth: 120 },
    { field: 'actualizadoEn', headerName: 'Actualizado', flex: 0.6, minWidth: 160, valueFormatter: (p) => formatDate(p.value as string) },
    {
      field: 'acciones', headerName: 'Acciones', width: 150, sortable: false,
      renderCell: (params: GridRenderCellParams<any>) => (
        <div>
          <IconButton onClick={() => { setEdited(params.row as Inventario); setModalType('edit') }}>
            <Edit style={{color: 'rgba(241, 218, 6, 1)'}} className='icon-editar' />
          </IconButton>
          <IconButton onClick={() => { setDeleteId(params.row.id); setModalType('delete') }}>
            <Delete style={{color: 'rgba(228, 69, 6, 1)'}} className='icon-eliminar' />
          </IconButton>
        </div>
      )
    }
  ]

  return (
    <div className='contenido'>
      <div id='inventario' className='bloque-formulario'>
        <div><h2>Stock de Productos</h2></div>

        <div className='bloque-botones' style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            style={{ marginTop: '0px' }}
            className='boton-formulario'
            onClick={() => { setEdited(defaultInventario); setModalType('create') }}>
            Agregar Registro
          </button>
          <input
            className='form-control'
            style={{ maxWidth: 320 }}
            placeholder='Buscar producto, código o sucursal'
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
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
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

        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? 'Agregar Registro' : 'Editar Registro'}
            textBtn='Guardar'
            isFormValid={isFormValid}
            content={
              <div style={grid2ColStyle}>
                <div className='form-group' style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className='form-label required'>Producto</label>
                  <select
                    className='form-control'
                    value={edited.productoId || 0}
                    onChange={(e) => setEdited(prev => ({ ...prev, productoId: Number(e.target.value) }))}
                    required
                  >
                    <option value={0} disabled>Seleccione un producto</option>
                    {productos.filter(p => p.productoServicio === false).map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
                    ))}
                  </select>
                </div>

                <div className='form-group' style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className='form-label required'>Punto de Venta</label>
                  <select
                    className='form-control'
                    value={edited.puntoventaId || 0}
                    onChange={(e) => setEdited(prev => ({ ...prev, puntoventaId: Number(e.target.value) }))}
                    required
                  >
                    <option value={0} disabled>Seleccione un punto de venta</option>
                    {puntos.map(pv => (
                      <option key={pv.id} value={pv.id}>{pv.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className='form-group' style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className='form-label required'>Cantidad</label>
                  <input
                    type='number'
                    min={0}
                    className='form-control'
                    value={edited.cantidad}
                    onChange={(e) => setEdited(prev => ({ ...prev, cantidad: Number(e.target.value) }))}
                    required
                  />
                </div>
              </div>
            }
            onConfirm={() => {
              const op = modalType
              if (op === 'create') {
                InventarioService.insertar(edited).then(() => { setEdited(defaultInventario); closeModal(); load() })
              } else {
                InventarioService.editar(edited).then(() => { setEdited(defaultInventario); closeModal(); load() })
              }
            }}
            closeModal={closeModal}
          />
        )}

        {modalType === 'delete' && (
          <ModalDialog
            title='Confirmar Eliminación'
            content={`¿Está seguro que desea eliminar el registro #${deleteId}?`}
            textBtn='Eliminar'
            confirmButtonClass='btn-danger'
            onConfirm={() => {
              InventarioService.eliminar(deleteId).then(() => { closeModal(); load() })
            }}
            closeModal={closeModal}
          />
        )}
      </div>
    </div>
  )
}

export { StockProductosWidget }
