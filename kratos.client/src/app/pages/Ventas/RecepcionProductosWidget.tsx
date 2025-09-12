import { useEffect, useMemo, useState } from 'react'
import '../../Styles/estilos.css'
import { Box, Typography, Button, TextField, Chip } from '@mui/material'

import PedidoService from '../../services/Ventas/PedidoService'
import RecepcionService from '../../services/Ventas/RecepcionService'
import PuntoVentaService from '../../services/Ventas/PuntoVentaService'
import CompraService from '../../services/Ventas/CompraService'

import { Compra } from '../../interfaces/Ventas/Compra'
import { PedidoItem } from '../../interfaces/Ventas/Pedido'

type UsuarioLite = { id: number; email?: string; nombres?: string; apellidos?: string }

export function RecepcionProductosWidget() {
  const [compras, setCompras] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioLite[]>([])
  const [lineas, setLineas] = useState<PedidoItem[]>([])
  const [puntos, setPuntos] = useState<any[]>([])

  // Mantener Selects como strings para evitar mismatch con MUI
  const [compraId, setCompraId] = useState<string>('')
  const [usuarioId, setUsuarioId] = useState<string>('')
  const [pvId, setPvId] = useState<string>('')
  const [entregadoPor, setEntregadoPor] = useState<string>('')
  const [fechaHora, setFechaHora] = useState<string>(() => new Date().toISOString().slice(0,16)) // yyyy-MM-ddTHH:mm

  const [marcados, setMarcados] = useState<Record<number, boolean>>({}) // pedidoId -> completo
  const [iniciada, setIniciada] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  // Cargar puntos de venta al iniciar
  useEffect(() => {
    console.log('[Recepcion] Cargando puntos de venta...')
    PuntoVentaService.getAll()
      .then(resp => {
        console.log('[Recepcion] Puntos de venta:', resp.data)
        setPuntos(Array.isArray(resp.data) ? resp.data : [])
      })
      .catch(err => {
        console.error('[Recepcion] Error cargando puntos de venta:', err?.response?.status, err?.response?.data || err?.message)
        setPuntos([])
      })
  }, [])

  // Cargar compras pendientes filtradas por punto de venta (solo no recibidas)
  useEffect(() => {
    if (!pvId) {
      setCompras([])
      setCompraId('')
      return
    }
    setLoading(true)
    console.log('[Recepcion] Cargando compras pendientes no recibidas para PV:', pvId)
    RecepcionService.ordenesPendientes(Number(pvId))
      .then(resp => {
        console.log('[Recepcion] /api/Recepciones/ordenesPendientes status:', resp.status)
        console.log('[Recepcion] Datos compras pendientes (no recibidas):', resp.data)
        const list = Array.isArray(resp.data) ? resp.data : []
        console.log('[Recepcion] Total compras pendientes (no recibidas):', list.length)
        setCompras(list)
      })
      .catch(err => {
        console.error('[Recepcion] Error cargando compras no recibidas:', err?.response?.status, err?.response?.data || err?.message)
        setCompras([])
      })
      .finally(() => setLoading(false))
  }, [pvId])

  const onSelectCompra = (id: string) => {
    setCompraId(id)
    setIniciada(false)
    setLineas([])
    setUsuarios([])
    setMarcados({})
    if (!id) return
    // cargar usuarios de la misma empresa
    console.log('[Recepcion] Cargando usuarios para compraId:', id)
    RecepcionService.usuariosPorCompra(Number(id))
      .then(resp => {
        console.log('[Recepcion] /api/Recepciones/usuariosPorCompra status:', resp.status)
        console.log('[Recepcion] Usuarios recibidos:', resp.data)
        const list: UsuarioLite[] = Array.isArray(resp.data) ? resp.data : []
        console.log('[Recepcion] Total usuarios:', list.length)
        setUsuarios(list)
      })
      .catch(err => {
        console.error('[Recepcion] Error cargando usuarios por compra:', err?.response?.status, err?.response?.data || err?.message)
        setUsuarios([])
      })
  }

  const iniciarRecepcion = () => {
    if (!compraId) return
    setLoading(true)
    PedidoService.leerPorCompra(Number(compraId))
      .then(resp => {
        const arr: PedidoItem[] = Array.isArray(resp.data) ? resp.data : []
        setLineas(arr)
        const init: Record<number, boolean> = {}
        arr.forEach(l => { init[l.id] = false })
        setMarcados(init)
        setIniciada(true)
      })
      .finally(() => setLoading(false))
  }

  const toggleLinea = (id: number, completo: boolean) => {
    setMarcados(prev => ({ ...prev, [id]: completo }))
  }

  const finalizarRecepcion = () => {
    if (!compraId) return
    const detalles = Object.entries(marcados).map(([pid, comp]) => ({ pedidoId: Number(pid), completo: !!comp }))
    RecepcionService.aplicar({
      compraId: Number(compraId),
      fechaHora: fechaHora ? new Date(fechaHora).toISOString() : undefined,
      entregadoPor: entregadoPor || undefined,
      usuarioId: usuarioId ? Number(usuarioId) : undefined,
      detalles,
    })
      .then(() => {
        alert('Recepción aplicada correctamente')
        setIniciada(false)
        setLineas([])
        setMarcados({})
        // refrescar compras pendientes
        return RecepcionService.ordenesPendientes().then(resp => setCompras(Array.isArray(resp.data) ? resp.data : []))
      })
      .catch(err => {
        console.error(err)
        alert('Error al aplicar la recepción')
      })
  }

  const compraSeleccionada = useMemo(() => compras.find((c: any) => String(c.id) === compraId), [compras, compraId])

  return (
    <div className='contenido'>
      <div className='bloque-formulario pos-card'>
        <div className='pos-header'>
          <h2 className='pos-title'>Recepción de productos</h2>
          {compraSeleccionada && (
            <div className='pos-summary'>
              <span className='pos-pill'>Compra #{compraSeleccionada.id}</span>
              <span className='pos-pill'>Punto: {compraSeleccionada.puntoVentaNombre ?? compraSeleccionada.puntoVentaId}</span>
              <span className='pos-pill'>Proveedor: {compraSeleccionada.proveedorNombre ?? 'N/A'}</span>
            </div>
          )}
        </div>

        <div className='pos-controls m-4'>
          <div className='form-group'>
            <label style={{ color: 'white' }} className='form-label required'>Punto de venta</label>
            <select className='form-control' value={pvId} onChange={(e) => { setPvId(String(e.target.value)); setCompraId(''); setUsuarios([]); setLineas([]); setIniciada(false); }}>
              <option value=''>Seleccione un punto</option>
              {puntos.map((pv: any) => (
                <option key={pv.id} value={String(pv.id)}>{pv.nombre}</option>
              ))}
            </select>
          </div>
          <div className='form-group'>
            <label style={{ color: 'white' }} className='form-label required'>Compra</label>
            <select className='form-control' value={compraId} onChange={(e) => onSelectCompra(String(e.target.value))}>
              <option value=''>Seleccione una compra</option>
              {compras.map((c: any) => (
                <option key={c.id} value={String(c.id)}>#{c.id} · {c.proveedorNombre ?? 'Sin proveedor'} · {new Date(c.fecha).toLocaleString()}</option>
              ))}
            </select>
          </div>
          <div className='form-group'>
            <label style={{ color: 'white' }} className='form-label'>Fecha y hora</label>
            <input className='form-control' type='datetime-local' value={fechaHora} onChange={(e) => setFechaHora(e.target.value)} />
          </div>
          <div className='form-group'>
            <label style={{ color: 'white' }} className='form-label'>Entregado por</label>
            <input className='form-control' value={entregadoPor} onChange={(e) => setEntregadoPor(e.target.value)} />
          </div>
          <div className='form-group'>
            <label style={{ color: 'white' }} className='form-label'>Usuario</label>
            <select className='form-control' value={usuarioId} onChange={(e) => setUsuarioId(String(e.target.value))}>
              <option value=''>Seleccione un usuario</option>
              {usuarios.map(u => (
                <option key={u.id} value={String(u.id)}>{`${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || u.email || `ID ${u.id}`}</option>
              ))}
            </select>
          </div>

          <div className='form-group'>
            <Button variant='contained' onClick={iniciarRecepcion} disabled={!compraId || loading}>
              Iniciar recepción
            </Button>
            {compraSeleccionada && (
              <Chip sx={{ ml: 2 }} label={`Punto de venta: ${compraSeleccionada.puntoVentaNombre ?? compraSeleccionada.puntoVentaId}`} />
            )}
          </div>
        </div>
      </div>

      {iniciada && (
        <div className='bloque-formulario pos-card' style={{ marginTop: '1rem' }}>
          <div className='pos-items-grid'>
            {lineas.map(l => (
              <div key={l.id} className='pos-item-card'>
                <div className='pos-item-header'>
                  <div>
                    <div className='pos-item-title'>{l.productoNombre ?? `Producto #${l.productoId}`}</div>
                    <div className='pos-item-sub'>Código: {l.productoCodigo ?? l.productoId}</div>
                  </div>
                </div>
                <div className='pos-item-body'>
                  <div className='pos-item-row'>
                    <span>Cantidad</span>
                    <strong>{l.cantidad}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <Button variant={marcados[l.id] ? 'contained' : 'outlined'} color='success' onClick={() => toggleLinea(l.id, true)}>Completo</Button>
                    <Button variant={!marcados[l.id] ? 'contained' : 'outlined'} color='warning' onClick={() => toggleLinea(l.id, false)}>Incompleto</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='pos-actions' style={{ marginTop: 16 }}>
            <Button className='btn-xl' variant='contained' color='primary' onClick={finalizarRecepcion} disabled={!compraId}>
              Finalizar recepción
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecepcionProductosWidget
