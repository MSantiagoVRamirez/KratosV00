import React, { useEffect, useMemo, useState } from 'react'
import '../../Styles/estilos.css'
import { IconButton } from '@mui/material'
import { Edit, Delete, AddShoppingCart, CheckCircle, Cancel } from '@mui/icons-material'
import { grid2ColStyle } from '../../utils'
import { ModalDialog } from '../components/ModalDialog'
import { Compra, EstadoCompra, TipoCompra, TipoPagoCompra } from '../../interfaces/Ventas/Compra'
import { PedidoItem } from '../../interfaces/Ventas/Pedido'
import CompraService from '../../services/Ventas/CompraService'
import PedidoService from '../../services/Ventas/PedidoService'
import ProductoService from '../../services/Ventas/ProductoService'
import PuntoVentaService from '../../services/Ventas/PuntoVentaService'
import { Producto } from '../../interfaces/Ventas/Producto'
import { PuntoVenta } from '../../interfaces/Ventas/PuntoVenta'
import ProveedorService from '../../services/Ventas/ProveedorService'
import { Proveedor } from '../../interfaces/Ventas/Proveedor'
import usuarioService from '../../services/seguridad/usuarioService'
import { Usuario } from '../../interfaces/seguridad/Usuario'

const getEstadoCompraText = (estado: number) => {
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
const getTipoCompraText = (t: number) => {
  switch (t) {
    case 0: return 'Contado'
    case 1: return 'Credito'
    case 2: return 'Mixto'
    default: return 'Desconocido'
  }
}
const getTipoPagoText = (t: number) => {
  switch (t) {
    case 0: return 'Efectivo'
    case 1: return 'Tarjeta Credito'
    case 2: return 'Tarjeta Debito'
    case 3: return 'Transferencia'
    case 4: return 'Otro'
    default: return 'Desconocido'
  }
}

const OrdenCompraWidget: React.FC = () => {
  // Compra actual
  const [compra, setCompra] = useState<Compra | null>(null)
  const [puntos, setPuntos] = useState<PuntoVenta[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [lineas, setLineas] = useState<PedidoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form para iniciar compra
  const [pvId, setPvId] = useState<number>(0)
  const [compraId, setCompraId] = useState<number>(0)
  const [numeroFactura, setNumeroFactura] = useState<string>('')
  const [tipoCompra, setTipoCompra] = useState<TipoCompra>(TipoCompra.Contado)
  const [tipoPago, setTipoPago] = useState<TipoPagoCompra>(TipoPagoCompra.Efectivo)
  const [proveedorId, setProveedorId] = useState<number>(0)
  const [solicitanteId, setSolicitanteId] = useState<number>(0)

  // Form para agregar/editar linea
  const defaultItem: PedidoItem = {
    id: 0, compraId: 0, productoId: 0, precioUnitario: 0, cantidad: 1,
    porcentajeInpuesto: 0, porcentajeDescuento: 0, subTotal: 0,
  }
  const [editItem, setEditItem] = useState<PedidoItem>(defaultItem)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'finalizar' | 'cancelar' | null>(null)
  const [continuarModal, setContinuarModal] = useState(false)
  const [continuables, setContinuables] = useState<Compra[]>([])
  const [continuarCompraId, setContinuarCompraId] = useState<number>(0)

  const closeModal = () => setModalType(null)
  const closeContinuar = () => setContinuarModal(false)

  const cargarCatalogos = async () => {
    const results = await Promise.allSettled([
      PuntoVentaService.getAll(),
      ProductoService.leer(),
      ProveedorService.getAll(),
      usuarioService.getAll(),
    ])
    const [pvRes, prodRes, provRes, usrRes] = results
    if (pvRes.status === 'fulfilled' && Array.isArray(pvRes.value.data)) setPuntos(pvRes.value.data)
    if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data)) setProductos(prodRes.value.data)
    if (provRes.status === 'fulfilled' && Array.isArray(provRes.value.data)) setProveedores(provRes.value.data)
    if (usrRes.status === 'fulfilled' && Array.isArray(usrRes.value.data)) setUsuarios(usrRes.value.data)
  }

  useEffect(() => { cargarCatalogos() }, [])

  const cargarLineas = async (compraId: number) => {
    const { data } = await PedidoService.leerPorCompra(compraId)
    setLineas(Array.isArray(data) ? data : [])
  }

  const iniciarCompra = async () => {
    if (!pvId) { alert('Seleccione un punto de venta'); return }
    if (!proveedorId) { alert('Seleccione un proveedor'); return }
    setLoading(true)
    try {
      const { data } = await CompraService.crearPendiente({
        puntoVentaId: pvId,
        numeroFactura,
        tipoCompra,
        tipoPago,
        proveedorId: proveedorId || null,
        solicitanteId: solicitanteId || null,
      })
      if (typeof data === 'string') {
        alert(data || 'Acceso denegado. Inicie sesion e intente nuevamente.')
        return
      }
      setCompra(data as Compra)
      setCompraId((data as Compra).id)
      await cargarLineas((data as Compra).id)
    } catch (e: any) {
      setError(e?.response?.data || 'Error iniciando compra')
    } finally { setLoading(false) }
  }

  const agregarLinea = async () => {
    if (!compra) return
    if (!editItem.productoId) { alert('Seleccione un producto'); return }
    if (!editItem.cantidad || editItem.cantidad <= 0) { alert('Ingrese una cantidad valida'); return }
    const payload: PedidoItem = { ...editItem, compraId }
    try {
      await PedidoService.insertar(payload)
      await cargarLineas(compra.id)
      closeModal()
    } catch (e: any) {
      alert(e?.response?.data || 'No fue posible agregar el item')
    }
  }

  const actualizarLinea = async () => {
    if (!compra) return
    await PedidoService.editar(editItem)
    await cargarLineas(compra.id)
    closeModal()
  }

  const eliminarLinea = async (id: number) => {
    if (!compra) return
    await PedidoService.eliminar(id)
    await cargarLineas(compra.id)
  }

  const finalizarCompra = async (estado: 'Pagada' | 'PorCobrar') => {
    if (!compra) return
    await CompraService.finalizar(compraId, estado)
    setCompra(null)
    setLineas([])
    setNumeroFactura('')
    setCompraId(0)
  }

  const cancelarCompra = async () => {
    if (!compra) return
    await CompraService.cancelar(compraId)
    setCompra(null)
    setLineas([])
    setNumeroFactura('')
    setCompraId(0)
  }

  const abrirContinuar = async () => {
    setContinuarCompraId(0)
    try {
      const { data } = await CompraService.leerContinuables(pvId || undefined)
      setContinuables(Array.isArray(data) ? data : [])
      setContinuarModal(true)
    } catch (e) {
      setContinuables([])
      setContinuarModal(true)
    }
  }

  const confirmarContinuar = async () => {
    if (!continuarCompraId) { alert('Seleccione una compra'); return }
    try {
      const target = continuables.find(v => v.id === continuarCompraId)
      if (target && target.estado === EstadoCompra.Cancelada) {
        await CompraService.reabrir(target.id)
      }
      const { data } = await CompraService.consultar(continuarCompraId)
      setCompra(data as Compra)
      setCompraId(continuarCompraId)
      await cargarLineas(continuarCompraId)
      setContinuarModal(false)
    } catch (e) {
      alert('No fue posible continuar la compra')
    }
  }

  const total = useMemo(() => lineas.reduce((acc, x) => acc + (x.subTotal || 0), 0), [lineas])

  return (
    <div className='contenido'>
      <div id='ordencompra' className='bloque-formulario pos-card'>
        <div className='pos-header'>
          <h2 className='pos-title'>Orden de Compra</h2>
          {compra && (
            <div className='pos-summary'>
              <span className='pos-pill'>Compra #{compra.id}</span>
              <span className='pos-pill'>Punto: {puntos.find(p => p.id === (compra?.puntoVentaId || pvId))?.nombre || compra?.puntoVentaId || pvId}</span>
              <span className='pos-pill'>Proveedor: {proveedores.find(pr => pr.id === (compra?.proveedorId || proveedorId))?.nombre || compra?.proveedorId || proveedorId}</span>
              <span className='pos-pill'>Solicitante: {usuarios.find(u => u.id === (compra?.solicitanteId || solicitanteId)) ? `${usuarios.find(u => u.id === (compra?.solicitanteId || solicitanteId))?.nombres ?? ''} ${usuarios.find(u => u.id === (compra?.solicitanteId || solicitanteId))?.apellidos ?? ''}`.trim() : (compra?.solicitanteId || solicitanteId || 's/n')}</span>
              <span className='pos-total'>Total: ${total.toFixed(2)}</span>
            </div>
          )}
        </div>

        {!compra ? (
          <div className='pos-controls m-4'>
            <div className='form-group'>
              <label style={{ color: 'white' }} className='form-label required'>Punto de Venta</label>
              <select className='form-control' value={pvId} onChange={(e) => setPvId(Number(e.target.value))}>
                <option value={0}>Seleccione...</option>
                {puntos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className='form-group'>
              <label style={{ color: 'white' }} className='form-label required'>Proveedor</label>
              <select className='form-control' value={proveedorId} onChange={(e) => setProveedorId(Number(e.target.value))}>
                <option value={0}>Seleccione...</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className='form-group'>
              <label style={{ color: 'white' }} className='form-label'>Solicitante</label>
              <select className='form-control' value={solicitanteId} onChange={(e) => setSolicitanteId(Number(e.target.value))}>
                <option value={0}>Seleccione...</option>
                {usuarios.map(u => <option key={u.id} value={u.id}>{`${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || u.email}</option>)}
              </select>
            </div>
            <div className='form-group'>
              <label style={{ color: 'white' }} className='form-label'>Numero Factura</label>
              <input className='form-control' value={numeroFactura} onChange={(e) => setNumeroFactura(e.target.value)} />
            </div>
            <div className='form-group'>
              <label style={{ color: 'white' }} className='form-label'>Tipo Compra</label>
              <select className='form-control' value={tipoCompra} onChange={(e) => setTipoCompra(Number(e.target.value) as TipoCompra)}>
                <option value={0}>Contado</option>
                <option value={1}>Credito</option>
                <option value={2}>Mixto</option>
              </select>
            </div>
            <div className='form-group'>
              <label style={{ color: 'white' }} className='form-label'>Tipo Pago</label>
              <select className='form-control' value={tipoPago} onChange={(e) => setTipoPago(Number(e.target.value) as TipoPagoCompra)}>
                <option value={0}>Efectivo</option>
                <option value={1}>Tarjeta Credito</option>
                <option value={2}>Tarjeta Debito</option>
                <option value={3}>Transferencia</option>
                <option value={4}>Otro</option>
              </select>
            </div>
            <div className='pos-actions'>
              <button className='boton-formulario btn-xl' onClick={iniciarCompra} disabled={loading || !pvId || !proveedorId}>
                <AddShoppingCart style={{marginRight: 6}} /> Iniciar Compra
              </button>
              <button className='boton-formulario btn-xl' onClick={abrirContinuar}>
                <AddShoppingCart style={{marginRight: 6}} /> Continuar Compra
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className='pos-actions m-4'>
              <button className='boton-formulario' onClick={() => setModalType('add')} disabled={!compraId}>
                <AddShoppingCart style={{marginRight: 6}} /> Agregar Item
              </button>
              <button className='boton-formulario' onClick={() => setModalType('finalizar')}>
                <CheckCircle style={{marginRight: 6}} /> Finalizar
              </button>
              <button className='boton-formulario' onClick={() => setModalType('cancelar')}>
                <Cancel style={{marginRight: 6}} /> Cancelar
              </button>
            </div>

            <div className='pos-grid m-4'>
              <div className='pos-grid-main'>
                {lineas.length === 0 && <div className='pos-empty'>Sin items agregados</div>}
                {lineas.length > 0 && (
                  <div className='pos-items-grid'>
                    {lineas.map((l) => (
                      <div key={l.id} className='pos-item-card'>
                        <div className='pos-item-header'>
                          <div>
                            <div className='pos-item-title'>{l.productoNombre || ''}</div>
                            <div className='pos-item-sub'>Codigo: {l.productoCodigo || l.productoId}</div>
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
                          <div className='pos-item-row'><span>Precio</span><span>${Number(l.precioUnitario).toFixed(2)}</span></div>
                          <div className='pos-item-row'><span>Cantidad</span><span>{l.cantidad}</span></div>
                          <div className='pos-item-row'><span>Desc.</span><span>{Number(l.porcentajeDescuento).toFixed(2)}%</span></div>
                          <div className='pos-item-row'><span>IVA</span><span>{Number(l.porcentajeInpuesto).toFixed(2)}%</span></div>
                          <div className='pos-item-row total'><span>Subtotal</span><span>${Number(l.subTotal).toFixed(2)}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className='pos-grid-side'>
                <div className='pos-side-card'>
                  <div className='pos-side-row'>
                    <span>Items</span>
                    <span>{lineas.length}</span>
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

        {error && <div className='alert alert-danger m-4'>{error}</div>}

        {modalType === 'add' && (
          <ModalDialog
            title='Agregar Item'
            textBtn='Agregar'
            content={
              <div style={grid2ColStyle}>
                <div className='form-group'>
                  <label style={{ color: 'white' }} className='form-label required'>Producto</label>
                  <select className='form-control' value={editItem.productoId} onChange={(e) => {
                    const id = Number(e.target.value)
                    const prod = productos.find(p => p.id === id)
                    setEditItem(prev => ({
                      ...prev,
                      productoId: id,
                      precioUnitario: prev.precioUnitario && prev.precioUnitario > 0 ? prev.precioUnitario : (prod?.costo ?? 0),
                    }))
                  }}>
                    <option value={0}>Seleccione...</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
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
            title='Editar Item'
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
            title='Finalizar Compra'
            textBtn='Continuar'
            content={
              <div style={{ color: 'white' }}>
                Desea finalizar la compra? Seleccione el estado final:
                <div className='d-flex gap-2 mt-3'>
                  <button className='boton-formulario' onClick={() => finalizarCompra('Pagada')}>Marcar como Pagada</button>
                  <button className='boton-formulario' onClick={() => finalizarCompra('PorCobrar')}>Marcar como Por Cobrar</button>
                </div>
              </div>
            }
            onConfirm={() => {}}
            closeModal={closeModal}
          />
        )}

        {modalType === 'cancelar' && (
          <ModalDialog
            title='Cancelar Compra'
            textBtn='Cancelar Compra'
            confirmButtonClass='btn-danger'
            content={<div style={{ color: 'white' }}>Esta accion eliminara todas las lineas asociadas. Desea continuar?</div>}
            onConfirm={cancelarCompra}
            closeModal={closeModal}
          />
        )}

        {continuarModal && (
          <ModalDialog
            title='Continuar Compra'
            textBtn='Confirmar'
            content={
              <div style={grid2ColStyle}>
                <div className='form-group' style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className='form-label'>Seleccione una compra (Pendiente o Cancelada)</label>
                  <select className='form-control' value={continuarCompraId} onChange={(e) => setContinuarCompraId(Number(e.target.value))}>
                    <option value={0}>Seleccione...</option>
                    {continuables.map(v => (
                      <option key={v.id} value={v.id}>
                        #{v.id} - {new Date(v.fecha || '').toLocaleString()} - {v.numeroFactura || 's/f'} - Estado: {getEstadoCompraText(Number(v.estado))} - {getTipoCompraText(Number(v.tipoCompra))} - Pago: {getTipoPagoText(Number(v.tipoPago))}
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

export { OrdenCompraWidget }

