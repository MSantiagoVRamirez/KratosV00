import React, { useEffect, useMemo, useState } from 'react'
import '../../Styles/estilos.css'
import { IconButton } from '@mui/material'
import { Edit, Delete, AddShoppingCart, CheckCircle, Cancel } from '@mui/icons-material'
import { grid2ColStyle } from '../../utils'
import { ModalDialog } from '../components/ModalDialog'
import { Venta, EstadoVenta, TipoPago, TipoVenta } from '../../interfaces/Ventas/Venta'
import { POSItem } from '../../interfaces/Ventas/POS'
import VentaService from '../../services/Ventas/VentaService'
import POSService from '../../services/Ventas/POSService'
import ProductoService from '../../services/Ventas/ProductoService'
import PuntoVentaService from '../../services/Ventas/PuntoVentaService'
import { Producto } from '../../interfaces/Ventas/Producto'
import { PuntoVenta } from '../../interfaces/Ventas/PuntoVenta'
import usuarioService from '../../services/seguridad/usuarioService'
import { Usuario } from '../../interfaces/seguridad/Usuario'

// Helpers para mostrar nombres de enumerables (mismo criterio que Ventas)
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

const POSWidget: React.FC = () => {
  // Venta actual
  const [venta, setVenta] = useState<Venta | null>(null)
  const [puntos, setPuntos] = useState<PuntoVenta[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [lineas, setLineas] = useState<POSItem[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form para iniciar venta
  const [pvId, setPvId] = useState<number>(0)
  const [numeroFactura, setNumeroFactura] = useState<string>('')
  const [tipoVenta, setTipoVenta] = useState<TipoVenta>(TipoVenta.Contado)
  const [tipoPago, setTipoPago] = useState<TipoPago>(TipoPago.Efectivo)
  const [clienteId, setClienteId] = useState<number>(0)
  const [vendedorId, setVendedorId] = useState<number>(0)

  // Form para agregar/editar línea
  const defaultItem: POSItem = {
    id: 0, ventaId: 0, productoId: 0, precioUnitario: 0, cantidad: 1,
    porcentajeInpuesto: 0, porcentajeDescuento: 0, subTotal: 0,
  }
  const [editItem, setEditItem] = useState<POSItem>(defaultItem)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'finalizar' | 'cancelar' | null>(null)
  const [continuarModal, setContinuarModal] = useState(false)
  const [continuables, setContinuables] = useState<Venta[]>([])
  const [continuarVentaId, setContinuarVentaId] = useState<number>(0)

  const closeModal = () => setModalType(null)
  const closeContinuar = () => setContinuarModal(false)

  const cargarCatalogos = async () => {
    const results = await Promise.allSettled([
      PuntoVentaService.getAll(),
      ProductoService.leer(),
      usuarioService.getAll(),
    ])

    const [pvRes, prodRes, usrRes] = results
    if (pvRes.status === 'fulfilled' && Array.isArray(pvRes.value.data)) setPuntos(pvRes.value.data)
    if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data)) setProductos(prodRes.value.data)
    if (usrRes.status === 'fulfilled' && Array.isArray(usrRes.value.data)) setUsuarios(usrRes.value.data)
  }

  const cargarLineas = async (ventaId: number) => {
    const { data } = await POSService.leerPorVenta(ventaId)
    setLineas(Array.isArray(data) ? data : [])
  }

  const iniciarVenta = async () => {
    if (!pvId) { alert('Seleccione un punto de venta'); return }
    setLoading(true)
    try {
      const { data } = await VentaService.crearPendiente({ puntoVentaId: pvId, numeroFactura, tipoVenta, tipoPago, clienteId: clienteId || null, vendedorId: vendedorId || null })
      setVenta(data as Venta)
      await cargarLineas((data as Venta).id)
    } catch (e: any) {
      setError(e?.response?.data || 'Error iniciando venta')
    } finally { setLoading(false) }
  }

  const abrirContinuar = async () => {
    setContinuarVentaId(0)
    try {
      const { data } = await VentaService.leerContinuables(pvId || undefined)
      setContinuables(Array.isArray(data) ? data : [])
      setContinuarModal(true)
    } catch (e) {
      setContinuables([])
      setContinuarModal(true)
    }
  }

  const confirmarContinuar = async () => {
    if (!continuarVentaId) { alert('Seleccione una venta'); return }
    try {
      // Si es cancelada, reabrir
      const target = continuables.find(v => v.id === continuarVentaId)
      if (target && target.estado === 3 /* Cancelada */) {
        await VentaService.reabrir(target.id)
        target.estado = 0 // Pendiente
        target.activo = true
        target.estaCancelada = false
      }
      if (target) {
        setVenta(target)
        setPvId(target.puntoVentaId)
        setNumeroFactura(target.numeroFactura || '')
        setTipoVenta(target.tipoVenta)
        setTipoPago(target.tipoPago)
        setClienteId(target.clienteId || 0)
        setVendedorId(target.vendedorId || 0)
        await cargarLineas(target.id)
      }
      closeContinuar()
    } catch (e: any) {
      alert(e?.response?.data || 'No fue posible continuar la venta seleccionada')
    }
  }

  const agregarLinea = async () => {
    if (!venta) return
    if (!editItem.productoId || editItem.cantidad <= 0) { alert('Seleccione producto y cantidad válida'); return }
    const payload = { ...editItem, ventaId: venta.id }
    await POSService.insertar(payload)
    await cargarLineas(venta.id)
    setEditItem({ ...defaultItem, ventaId: venta.id })
    closeModal()
  }

  const actualizarLinea = async () => {
    if (!venta) return
    await POSService.editar(editItem)
    await cargarLineas(venta.id)
    closeModal()
  }

  const eliminarLinea = async (id: number) => {
    if (!venta) return
    await POSService.eliminar(id)
    await cargarLineas(venta.id)
  }

  const finalizarVenta = async (siguienteEstado: 'Pagada' | 'PorCobrar') => {
    if (!venta) return
    try {
      await VentaService.finalizar(venta.id, siguienteEstado)
      setVenta(null)
      setLineas([])
      setNumeroFactura('')
      setPvId(0)
      closeModal()
    } catch (e: any) {
      alert(e?.response?.data || 'No fue posible finalizar la venta')
    }
  }

  const cancelarVenta = async () => {
    if (!venta) return
    await VentaService.cancelar(venta.id)
    setVenta(null)
    setLineas([])
    setNumeroFactura('')
    setPvId(0)
    closeModal()
  }

  useEffect(() => { cargarCatalogos() }, [])

  const total = useMemo(() => lineas.reduce((acc, l) => acc + (l.subTotal || 0), 0), [lineas])

  // Tabla reemplazada por tarjetas: no se usa DataGrid

  return (
    <div className='contenido'>
      <div id='pos' className='bloque-formulario pos-card'>
        <div className='pos-header'>
          <h2 className='pos-title'>Punto de Venta</h2>
          {venta && (
            <div className='pos-summary'>
              <span className='pos-pill'>Venta #{venta.id}</span>
              <span className='pos-pill'>Punto: {puntos.find(p => p.id === venta.puntoVentaId)?.nombre || venta.puntoVentaId}</span>
              <span className='pos-pill'>Vendedor: {venta.vendedorId ? (usuarios.find(u => u.id === venta.vendedorId)?.nombres + ' ' + (usuarios.find(u => u.id === venta.vendedorId)?.apellidos ?? '')) : '—'}</span>
              <span className='pos-pill'>Cliente: {venta.clienteId ? (usuarios.find(u => u.id === venta.clienteId)?.nombres + ' ' + (usuarios.find(u => u.id === venta.clienteId)?.apellidos ?? '')) : '—'}</span>
              <span className='pos-total'>Total: ${total.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Iniciar venta */}
        {!venta && (
          <div className='pos-controls m-4'>
            <div className='form-group'>
              <label style={{ color: 'white' }} className='form-label required'>Punto de Venta</label>
              <select className='form-control' value={pvId} onChange={(e) => setPvId(Number(e.target.value))}>
                <option value={0} disabled>Seleccione un punto</option>
                {puntos.map(pv => (<option key={pv.id} value={pv.id}>{pv.nombre}</option>))}
              </select>
            </div>
            <div className='form-group'>
              <label style={{ color: 'white' }} className='form-label'>Número de factura</label>
              <input className='form-control' value={numeroFactura} onChange={(e) => setNumeroFactura(e.target.value)} />
            </div>
            <div className='form-group'>
              <label style={{ color: 'white' }} className='form-label'>Vendedor</label>
              <select className='form-control' value={vendedorId} onChange={(e) => setVendedorId(Number(e.target.value))}>
                <option value={0}>No asignar</option>
                {usuarios.map(u => (<option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>))}
              </select>
            </div>
            <div className='form-group'>
              <label style={{ color: 'white' }} className='form-label'>Cliente</label>
              <select className='form-control' value={clienteId} onChange={(e) => setClienteId(Number(e.target.value))}>
                <option value={0}>No asignar</option>
                {usuarios.map(u => (<option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>))}
              </select>
            </div>
            <div className='form-group'>
              <label style={{ color: 'white' }} className='form-label'>Tipo de Venta</label>
              <select className='form-control' value={tipoVenta} onChange={(e) => setTipoVenta(Number(e.target.value))}>
                <option value={TipoVenta.Contado}>Contado</option>
                <option value={TipoVenta.Credito}>Crédito</option>
                <option value={TipoVenta.Mixto}>Mixto</option>
              </select>
            </div>
            <div className='form-group'>
              <label style={{ color: 'white' }} className='form-label'>Tipo de Pago</label>
              <select className='form-control' value={tipoPago} onChange={(e) => setTipoPago(Number(e.target.value))}>
                <option value={TipoPago.Efectivo}>Efectivo</option>
                <option value={TipoPago.TarjetaCredito}>Tarjeta Crédito</option>
                <option value={TipoPago.TarjetaDebito}>Tarjeta Débito</option>
                <option value={TipoPago.TransferenciaBancaria}>Transferencia</option>
                <option value={TipoPago.Otro}>Otro</option>
              </select>
            </div>
            <div className='pos-actions'>
              <button className='boton-formulario btn-xl' onClick={iniciarVenta} disabled={loading || !pvId}>
                <AddShoppingCart style={{marginRight: 6}} /> Iniciar Venta
              </button>
              <button className='boton-formulario btn-xl' onClick={abrirContinuar}>
                <AddShoppingCart style={{marginRight: 6}} /> Continuar Venta
              </button>
            </div>
          </div>
        )}

        {/* Venta activa */}
        {venta && (
          <>
            <div className='pos-actions m-4'>
              <button className='boton-formulario' onClick={() => setModalType('add')}>
                <AddShoppingCart style={{marginRight: 6}} /> Agregar Ítem
              </button>
              <button className='boton-formulario' onClick={() => setModalType('finalizar')}>
                <CheckCircle style={{marginRight: 6}} /> Finalizar
              </button>
              <button className='boton-formulario' onClick={() => setModalType('cancelar')}>
                <Cancel style={{marginRight: 6}} /> Cancelar
              </button>
            </div>

            <div className='pos-grid'>
              <div className='pos-grid-main'>
                <div className='pos-items-grid'>
                  {lineas.map((l) => (
                    <div key={l.id} className='pos-item-card'>
                      <div className='pos-item-header'>
                        <div>
                          <div className='pos-item-title'>{l.productoNombre || '—'}</div>
                          <div className='pos-item-sub'>Código: {l.productoCodigo || '—'}</div>
                        </div>
                        <div className='pos-item-actions'>
                          <IconButton size='small' onClick={() => { setEditItem(l); setModalType('edit') }}>
                            <Edit style={{color: 'rgba(241, 218, 6, 1)'}} fontSize='small' />
                          </IconButton>
                          <IconButton size='small' onClick={() => eliminarLinea(l.id)}>
                            <Delete style={{color: 'rgba(228, 69, 6, 1)'}} fontSize='small' />
                          </IconButton>
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
                  {lineas.length === 0 && (
                    <div className='pos-empty'>No hay ítems agregados todavía.</div>
                  )}
                </div>
              </div>
              <div className='pos-grid-side'>
                <div className='pos-side-card'>
                  <div className='pos-side-row'>
                    <span>Subtotal Ítems</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className='pos-side-row total'>
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Modales */}
        {modalType === 'add' && (
          <ModalDialog
            title='Agregar Ítem'
            textBtn='Agregar'
            content={
              <div style={grid2ColStyle}>
                <div className='form-group' style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className='form-label required'>Producto</label>
                  <select className='form-control' value={editItem.productoId} onChange={(e) => {
                    const id = Number(e.target.value)
                    const prod = productos.find(p => p.id === id)
                    setEditItem(prev => ({ ...prev, productoId: id, precioUnitario: prod?.precio ?? prev.precioUnitario }))
                  }}>
                    <option value={0} disabled>Seleccione un producto</option>
                    {productos.filter(p => p.productoServicio === false).map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
                    ))}
                  </select>
                </div>
                <div className='form-group'>
                  <label style={{ color: 'white' }} className='form-label required'>Cantidad</label>
                  <input type='number' min={1} className='form-control' value={editItem.cantidad} onChange={(e) => setEditItem(prev => ({ ...prev, cantidad: Number(e.target.value) }))} />
                </div>
                <div className='form-group'>
                  <label style={{ color: 'white' }} className='form-label required'>Precio</label>
                  <input type='number' min={0} className='form-control' value={editItem.precioUnitario} onChange={(e) => setEditItem(prev => ({ ...prev, precioUnitario: Number(e.target.value) }))} />
                </div>
                <div className='form-group'>
                  <label style={{ color: 'white' }} className='form-label'>Descuento %</label>
                  <input type='number' min={0} className='form-control' value={editItem.porcentajeDescuento} onChange={(e) => setEditItem(prev => ({ ...prev, porcentajeDescuento: Number(e.target.value) }))} />
                </div>
                <div className='form-group'>
                  <label style={{ color: 'white' }} className='form-label'>IVA %</label>
                  <input type='number' min={0} className='form-control' value={editItem.porcentajeInpuesto} onChange={(e) => setEditItem(prev => ({ ...prev, porcentajeInpuesto: Number(e.target.value) }))} />
                </div>
              </div>
            }
            onConfirm={agregarLinea}
            closeModal={closeModal}
          />
        )}

        {modalType === 'edit' && (
          <ModalDialog
            title='Editar Ítem'
            textBtn='Guardar'
            content={
              <div style={grid2ColStyle}>
                <div className='form-group'>
                  <label style={{ color: 'white' }} className='form-label required'>Cantidad</label>
                  <input type='number' min={1} className='form-control' value={editItem.cantidad} onChange={(e) => setEditItem(prev => ({ ...prev, cantidad: Number(e.target.value) }))} />
                </div>
                <div className='form-group'>
                  <label style={{ color: 'white' }} className='form-label required'>Precio</label>
                  <input type='number' min={0} className='form-control' value={editItem.precioUnitario} onChange={(e) => setEditItem(prev => ({ ...prev, precioUnitario: Number(e.target.value) }))} />
                </div>
                <div className='form-group'>
                  <label style={{ color: 'white' }} className='form-label'>Descuento %</label>
                  <input type='number' min={0} className='form-control' value={editItem.porcentajeDescuento} onChange={(e) => setEditItem(prev => ({ ...prev, porcentajeDescuento: Number(e.target.value) }))} />
                </div>
                <div className='form-group'>
                  <label style={{ color: 'white' }} className='form-label'>IVA %</label>
                  <input type='number' min={0} className='form-control' value={editItem.porcentajeInpuesto} onChange={(e) => setEditItem(prev => ({ ...prev, porcentajeInpuesto: Number(e.target.value) }))} />
                </div>
              </div>
            }
            onConfirm={actualizarLinea}
            closeModal={closeModal}
          />
        )}

        {modalType === 'finalizar' && (
          <ModalDialog
            title='Finalizar Venta'
            textBtn='Continuar'
            content={
              <div style={{ color: 'white' }}>
                ¿Desea finalizar la venta? Seleccione el estado final:
                <div className='d-flex gap-2 mt-3'>
                  <button className='boton-formulario' onClick={() => finalizarVenta('Pagada')}>Marcar como Pagada</button>
                  <button className='boton-formulario' onClick={() => finalizarVenta('PorCobrar')}>Marcar como Por Cobrar</button>
                </div>
              </div>
            }
            onConfirm={() => {}}
            closeModal={closeModal}
          />
        )}

        {modalType === 'cancelar' && (
          <ModalDialog
            title='Cancelar Venta'
            textBtn='Cancelar Venta'
            confirmButtonClass='btn-danger'
            content={<div style={{ color: 'white' }}>Esta acción eliminará todas las líneas POS asociadas. ¿Desea continuar?</div>}
            onConfirm={cancelarVenta}
            closeModal={closeModal}
          />
        )}

        {continuarModal && (
          <ModalDialog
            title='Continuar Venta'
            textBtn='Confirmar'
            content={
              <div style={grid2ColStyle}>
                <div className='form-group' style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className='form-label'>Seleccione una venta (Pendiente o Cancelada)</label>
                  <select className='form-control' value={continuarVentaId} onChange={(e) => setContinuarVentaId(Number(e.target.value))}>
                    <option value={0}>Seleccione...</option>
                    {continuables.map(v => (
                      <option key={v.id} value={v.id}>
                        #{v.id} • {new Date(v.fecha || '').toLocaleString()} • {v.numeroFactura || 's/f'} • Estado: {getEstadoVentaText(Number(v.estado))} • Venta: {getTipoVentaText(Number(v.tipoVenta))} • Pago: {getTipoPagoText(Number(v.tipoPago))}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            }
            onConfirm={confirmarContinuar}
            closeModal={closeContinuar}
          />
        )}
      </div>
    </div>
  )
}

export { POSWidget }
