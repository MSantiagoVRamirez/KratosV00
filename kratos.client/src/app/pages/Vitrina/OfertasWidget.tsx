import { useEffect, useMemo, useState } from 'react'
import { GridColDef, GridRenderCellParams, DataGrid } from '@mui/x-data-grid'
import { IconButton, Box } from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'

import { Oferta } from '../../interfaces/Ventas/Oferta'
import { Producto } from '../../interfaces/Ventas/Producto'
import OfertaService from '../../services/Ventas/OfertaService'
import ProductoService from '../../services/Ventas/ProductoService'
import { ModalDialog } from '../components/ModalDialog'
import { grid2ColStyle } from '../../utils'
import { useFormValidation } from '../../hooks/useFormValidation'
import { useAuth } from '../../modules/auth/AuthContext'

function formatApiError(err: any): string {
  const resp = err?.response
  if (!resp) return err?.message ?? 'Error desconocido'
  const data = resp.data
  if (data?.errors && typeof data.errors === 'object') {
    const lines: string[] = []
    for (const [field, msgs] of Object.entries<any>(data.errors)) {
      if (Array.isArray(msgs) && msgs.length) lines.push(`${field}: ${msgs.join(' | ')}`)
    }
    if (lines.length) return `Errores de validación:\n${lines.join('\n')}`
  }
  if (data?.detail || data?.title) return `${data.title ?? 'Error'}${data.detail ? `: ${data.detail}` : ''}`
  if (typeof data === 'string') return data
  try { return JSON.stringify(data) } catch { return resp.statusText || 'Error de servidor' }
}

export function OfertasWidget() {
  const { empresaId } = useAuth()

  const defaultOferta: Oferta = {
    id: 0,
    productoId: 0,
    empresaId: empresaId ?? 0,
    fechaInicio: new Date().toISOString(),
    fechaFin: new Date().toISOString(),
    porcentajeDescuento: 0,
    activo: true,
  }

  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [edited, setEdited] = useState<Oferta>(defaultOferta)
  const [deleteId, setDeleteId] = useState<number>(0)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)

  const closeModal = () => setModalType(null)

  const isFormValid = useFormValidation({
    productoId: { value: edited.productoId, required: true, type: 'number' },
    empresaId: { value: edited.empresaId, required: true, type: 'number' },
    fechaInicio: { value: edited.fechaInicio, required: true, type: 'string' },
    fechaFin: { value: edited.fechaFin, required: true, type: 'string' },
    porcentajeDescuento: { value: edited.porcentajeDescuento, required: true, type: 'number' },
  })

  const fetchOfertas = () => {
    OfertaService.getAll(empresaId ?? undefined)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : []
        setOfertas(data as unknown as Oferta[])
      })
      .catch(err => console.error('Error obteniendo ofertas', err))
  }

  const fetchProductos = () => {
    // Reutiliza el listado de productos (no servicios)
    ProductoService.leer()
      .then(res => {
        if (Array.isArray(res.data)) setProductos(res.data)
      })
      .catch(err => console.error('Error obteniendo productos', err))
  }

  useEffect(() => {
    fetchProductos()
    fetchOfertas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getProductoNombre = (productoId: number) => {
    return productos.find(p => p.id === productoId)?.nombre ?? `ID ${productoId}`
  }

  const columnas: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'productoId', headerName: 'Producto', flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <span>{getProductoNombre(params.row.productoId)}</span>
      )
    },
    { field: 'porcentajeDescuento', headerName: '% Desc', width: 110 },
    { field: 'fechaInicio', headerName: 'Inicio', width: 150 },
    { field: 'fechaFin', headerName: 'Fin', width: 150 },
    {
      field: 'activo', headerName: 'Estado', width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <span className={`badge fs-7 fw-bold ${params.row.activo ? 'badge-light-success' : 'badge-light-danger'}`}>
          {params.row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      field: 'acciones', headerName: 'Acciones', width: 150, sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton onClick={() => fetchOferta(params.row.id)}>
            <Edit style={{ color: 'rgba(241, 218, 6, 1)' }} />
          </IconButton>
          <IconButton onClick={() => openDeleteModal(params.row.id)}>
            <Delete style={{ color: 'rgba(228, 69, 6, 1)' }} />
          </IconButton>
        </Box>
      )
    }
  ]

  const fetchOferta = (id: number) => {
    OfertaService.get(id)
      .then(res => {
        const o = res.data as Oferta
        setEdited({ ...o, fechaInicio: new Date(o.fechaInicio).toISOString(), fechaFin: new Date(o.fechaFin).toISOString() })
        setModalType('edit')
      })
      .catch(err => console.error('Error obteniendo oferta', err))
  }

  const createOferta = (data: Oferta) => {
    OfertaService.create(data)
      .then(() => {
        setEdited(defaultOferta)
        closeModal()
        fetchOfertas()
      })
      .catch((error) => {
        console.error('Error al crear oferta', error)
        alert(`Error al crear oferta:\n${formatApiError(error)}`)
      })
  }

  const updateOferta = (data: Oferta) => {
    OfertaService.update(data)
      .then(() => {
        setEdited(defaultOferta)
        closeModal()
        fetchOfertas()
      })
      .catch((error) => {
        console.error('Error al actualizar oferta', error)
        alert(`Error al actualizar oferta:\n${formatApiError(error)}`)
      })
  }

  const deleteOferta = () => {
    OfertaService.remove(deleteId)
      .then(() => {
        setDeleteId(0)
        closeModal()
        fetchOfertas()
      })
      .catch((error) => {
        console.error('Error al eliminar oferta', error)
        alert(`Error al eliminar oferta:\n${formatApiError(error)}`)
      })
  }

  const openDeleteModal = (id: number) => {
    setDeleteId(id)
    setModalType('delete')
  }

  const productosOptions = useMemo(() => (
    productos.map(p => ({ value: p.id, label: `${p.codigo} - ${p.nombre}` }))
  ), [productos])

  return (
    <div className="contenido">
      <div className="bloque-formulario">
        <div><h2>Listado de Ofertas</h2></div>

        <div className="bloque-botones">
          <button
            style={{ marginTop: '0px' }}
            className="boton-formulario"
            onClick={() => { setEdited(defaultOferta); setModalType('create') }}
          >
            Agregar Oferta
          </button>

          <div style={{ height: '70%', width: '96%', margin: '1rem' }}>
            <DataGrid
              rows={ofertas}
              columns={columnas}
              disableRowSelectionOnClick
              getRowId={(row) => row.id}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 15]}
            />
          </div>
        </div>

        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? 'Agregar Oferta' : 'Editar Oferta'}
            isFormValid={isFormValid}
            content={
              <div style={grid2ColStyle}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Producto</label>
                  <select
                    className="form-control"
                    value={edited.productoId}
                    onChange={(e) => setEdited(prev => ({ ...prev, productoId: Number(e.target.value) }))}
                    required
                    style={{ backgroundColor: 'rgb(10, 70, 120)', color: 'white' }}
                  >
                    <option value={0} disabled>Seleccione un producto</option>
                    {productosOptions.map(opt => (
                      <option key={opt.value} value={opt.value} style={{ backgroundColor: 'rgb(10, 70, 120)', color: 'white' }}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Fecha Inicio</label>
                  <input
                    type="date"
                    className="form-control"
                    value={edited.fechaInicio.substring(0, 10)}
                    onChange={(e) => setEdited(prev => ({ ...prev, fechaInicio: new Date(e.target.value).toISOString() }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Fecha Fin</label>
                  <input
                    type="date"
                    className="form-control"
                    value={edited.fechaFin.substring(0, 10)}
                    onChange={(e) => setEdited(prev => ({ ...prev, fechaFin: new Date(e.target.value).toISOString() }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">% Descuento</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    className="form-control"
                    value={edited.porcentajeDescuento}
                    onChange={(e) => setEdited(prev => ({ ...prev, porcentajeDescuento: Number(e.target.value) }))}
                    required
                  />
                </div>

                <div className="form-group d-flex gap-3" style={{ alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    id="oferta-activo"
                    checked={!!edited.activo}
                    onChange={() => setEdited(prev => ({ ...prev, activo: !prev.activo }))}
                    className="form-check-input"
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-label" htmlFor="oferta-activo" style={{ color: 'white' }}>Activo</label>
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') createOferta(edited)
              else updateOferta(edited)
            }}
            closeModal={closeModal}
          />
        )}

        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content={`¿Está seguro que desea eliminar la oferta ${deleteId}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteOferta}
            closeModal={closeModal}
          />
        )}
      </div>
    </div>
  )
}
