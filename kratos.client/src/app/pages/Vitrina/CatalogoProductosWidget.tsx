import { useEffect, useMemo, useState } from 'react'
import '../../Styles/estilos.css'
import { grid2ColStyle } from '../../utils'
import { ModalDialog } from '../components/ModalDialog'
import { useAuth } from '../../modules/auth/AuthContext'
import { CatalogoItemCarrusel, CatalogoProductoConfig } from '../../interfaces/Vitrina/Catalogo'
import CatalogoService from '../../services/Ventas/CatalogoService'
import ProductoService from '../../services/Ventas/ProductoService'
import { Producto } from '../../interfaces/Ventas/Producto'

type TabKey = 'carrusel' | 'productos' | 'preview'

export function CatalogoProductosWidget() {
  const { empresaId } = useAuth()
  const empresa = empresaId ?? 0

  const [activeTab, setActiveTab] = useState<TabKey>('carrusel')

  // Carrusel
  const [items, setItems] = useState<CatalogoItemCarrusel[]>([])
  const [editedItem, setEditedItem] = useState<Partial<CatalogoItemCarrusel>>({ empresaId: empresa, activo: true, orden: 0, seccion: 'productos' })
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [modalType, setModalType] = useState<'createItem' | 'editItem' | 'deleteItem' | null>(null)
  const [deleteId, setDeleteId] = useState<number>(0)

  // Productos
  const [productos, setProductos] = useState<Producto[]>([])
  const [configs, setConfigs] = useState<CatalogoProductoConfig[]>([])
  const [search, setSearch] = useState('')

  const closeModal = () => setModalType(null)

  // Carga inicial
  const fetchCarrusel = () => {
    if (!empresa) return
    CatalogoService.leerCarrusel(empresa, 'productos')
      .then(res => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setItems([]))
  }
  const fetchProductos = () => {
    ProductoService.leer()
      .then(res => setProductos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProductos([]))
  }
  const fetchConfigs = () => {
    if (!empresa) return
    CatalogoService.leerProductosConfig(empresa)
      .then(res => setConfigs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setConfigs([]))
  }

  useEffect(() => { fetchCarrusel(); fetchProductos(); fetchConfigs() }, [])

  // Crear/editar carrusel
  const createItem = () => {
    if (!empresa) return
    const item = { ...editedItem, empresaId: empresa } as CatalogoItemCarrusel
    CatalogoService.insertarCarrusel(item, imagenFile)
      .then(() => { setEditedItem({ empresaId: empresa, activo: true, orden: 0 }); setImagenFile(null); closeModal(); fetchCarrusel() })
      .catch((e) => alert(e?.response?.data || 'Error al crear item'))
  }
  const updateItem = () => {
    if (!empresa || !editedItem.id) return
    const item = { ...editedItem, empresaId: empresa } as CatalogoItemCarrusel
    CatalogoService.editarCarrusel(item, imagenFile)
      .then(() => { setEditedItem({ empresaId: empresa, activo: true, orden: 0 }); setImagenFile(null); closeModal(); fetchCarrusel() })
      .catch((e) => alert(e?.response?.data || 'Error al editar item'))
  }
  const deleteItem = () => {
    if (!deleteId) return
    CatalogoService.eliminarCarrusel(deleteId)
      .then(() => { setDeleteId(0); closeModal(); fetchCarrusel() })
      .catch((e) => alert(e?.response?.data || 'Error al eliminar item'))
  }

  const openEditItem = (id: number) => {
    const it = items.find(i => i.id === id)
    if (!it) return
    setEditedItem({ ...it, seccion: 'productos' })
    setImagenFile(null)
    setModalType('editItem')
  }

  const openDeleteItem = (id: number) => { setDeleteId(id); setModalType('deleteItem') }

  // Productos config helpers
  const getCfg = (productoId: number): CatalogoProductoConfig => {
    const found = configs.find(c => c.productoId === productoId)
    if (found) return found
    return { productoId, visible: true }
  }
  const setCfg = (productoId: number, patch: Partial<CatalogoProductoConfig>) => {
    setConfigs(prev => {
      const idx = prev.findIndex(c => c.productoId === productoId)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], ...patch }
        return copy
      }
      return [...prev, { productoId, visible: true, ...patch }]
    })
  }
  const saveCfg = (productoId: number) => {
    if (!empresa) return
    const cfg = getCfg(productoId)
    CatalogoService.guardarProductoConfig(empresa, cfg)
      .then(() => fetchConfigs())
      .catch((e) => alert(e?.response?.data || 'Error guardando configuración'))
  }

  const filteredProductos = useMemo(() => {
    const term = (search || '').toLowerCase()
    return productos.filter(p => (p.productoServicio === false) && (
      p.nombre?.toLowerCase().includes(term) || p.codigo?.toLowerCase().includes(term) || p.descripcion?.toLowerCase().includes(term)
    ))
  }, [productos, search])

  // Preview
  const previewProductos = useMemo(() => {
    return filteredProductos.filter(p => getCfg(p.id).visible)
  }, [filteredProductos, configs])

  // Carrusel funcional en Preview
  const slides = useMemo(() => items.filter(i => i.activo).sort((a, b) => a.orden - b.orden), [items])
  const [activeIdx, setActiveIdx] = useState(0)
  useEffect(() => { setActiveIdx(0) }, [slides.length])
  useEffect(() => {
    if (slides.length === 0) return
    const current = slides[activeIdx]
    const interval = Math.max(1000, Number(current?.intervaloMs || 3000))
    const id = setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length)
    }, interval)
    return () => clearTimeout(id)
  }, [activeIdx, slides])

  return (
    <div className='contenido'>
      <div className='bloque-formulario'>
        <div><h2>Catálogo de Productos</h2></div>

        {/* Tabs */}
        <div className='d-flex gap-2 m-3'>
          <button className={`boton-formulario ${activeTab==='carrusel' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('carrusel')}>Carrusel</button>
          <button className={`boton-formulario ${activeTab==='productos' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('productos')}>Productos</button>
          <button className={`boton-formulario ${activeTab==='preview' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('preview')}>Vista Previa</button>
        </div>

        {/* Carrusel */}
        {activeTab === 'carrusel' && (
          <div className='m-3'>
            <button className='boton-formulario' onClick={() => { setEditedItem({ empresaId: empresa, activo: true, orden: 0 }); setImagenFile(null); setModalType('createItem') }}>Agregar Slide</button>
            <div className='d-flex flex-column gap-3 mt-4'>
              {items.map(it => (
                <div key={it.id} className='d-flex align-items-center gap-3 border border-1 border-gray-300 rounded p-3'>
                  <img src={it.imagenUrl ? it.imagenUrl : ''} alt={it.titulo || ''} style={{ width: 120, height: 70, objectFit: 'cover', background: '#222' }} />
                  <div className='flex-grow-1'>
                    <div className='text-white fw-bold'>{it.titulo}</div>
                    <div className='text-muted'>{it.descripcion}</div>
                    <div className='text-muted'>Orden: {it.orden} • Color: {it.tituloColor}</div>
                  </div>
                  <button className='boton-formulario' onClick={() => openEditItem(it.id)}>Editar</button>
                  <button className='boton-formulario' onClick={() => openDeleteItem(it.id)}>Eliminar</button>
                </div>
              ))}
              {items.length === 0 && <span className='text-muted'>Aún no hay slides.</span>}
            </div>
          </div>
        )}

        {/* Productos */}
        {activeTab === 'productos' && (
          <div className='m-3'>
            <div className='d-flex gap-2 mb-3'>
              <input className='form-control' placeholder='Buscar producto...' value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className='d-flex flex-column gap-3'>
              {filteredProductos.map(p => {
                const cfg = getCfg(p.id)
                return (
                  <div key={p.id} className='border border-1 border-gray-300 rounded p-3'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <div className='text-white fw-bold'>{p.nombre} <span className='text-muted'>({p.codigo})</span></div>
                      <div className='d-flex align-items-center gap-2'>
                        <input type='checkbox' className='form-check-input' checked={!!cfg.visible} onChange={() => setCfg(p.id, { visible: !cfg.visible })} />
                        <span className='text-muted'>Visible</span>
                      </div>
                    </div>
                    <div className='mt-3' style={grid2ColStyle}>
                      <div className='form-group'>
                        <label style={{ color: 'white' }} className='form-label'>Título personalizado</label>
                        <input className='form-control' value={cfg.tituloPersonalizado || ''} onChange={(e) => setCfg(p.id, { tituloPersonalizado: e.target.value })} />
                      </div>
                      <div className='form-group'>
                        <label style={{ color: 'white' }} className='form-label'>Palabras clave</label>
                        <input className='form-control' placeholder='separa por comas' value={cfg.palabrasClave || ''} onChange={(e) => setCfg(p.id, { palabrasClave: e.target.value })} />
                      </div>
                      <div className='form-group' style={{ gridColumn: 'span 2' }}>
                        <label style={{ color: 'white' }} className='form-label'>Descripción personalizada</label>
                        <textarea className='form-control' rows={2} value={cfg.descripcionPersonalizada || ''} onChange={(e) => setCfg(p.id, { descripcionPersonalizada: e.target.value })} />
                      </div>
                    </div>
                    <div className='d-flex justify-content-end'>
                      <button className='boton-formulario' onClick={() => saveCfg(p.id)}>Guardar</button>
                    </div>
                  </div>
                )
              })}
              {filteredProductos.length === 0 && <span className='text-muted'>No hay productos.</span>}
            </div>
          </div>
        )}

        {/* Vista Previa */}
        {activeTab === 'preview' && (
          <div className='m-3'>
            <div className='mb-4'>
              {/* Carrusel funcional */}
              <div className='position-relative' style={{ width: '100%', maxWidth: 720, margin: '0 auto' }}>
                {slides.length > 0 ? (
                  <div className='border border-1 border-gray-300 rounded' key={slides[activeIdx].id}>
                    <div style={{ position: 'relative' }}>
                      <img src={slides[activeIdx].imagenUrl || ''} alt={slides[activeIdx].titulo || ''} style={{ width: '100%', height: 280, objectFit: 'cover', background: '#222' }} />
                      <div style={{ position: 'absolute', bottom: 12, left: 12, color: slides[activeIdx].tituloColor || '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontSize: 20, fontWeight: 700 }}>{slides[activeIdx].titulo}</div>
                    </div>
                    <div className='p-2 text-muted'>{slides[activeIdx].descripcion}</div>
                  </div>
                ) : (
                  <div className='text-muted'>Sin slides activos.</div>
                )}
                {slides.length > 1 && (
                  <div className='d-flex justify-content-center gap-2 mt-2'>
                    {slides.map((_, idx) => (
                      <button key={idx} className='btn btn-sm' style={{ width: 10, height: 10, borderRadius: 9999, padding: 0, background: idx === activeIdx ? '#fff' : '#666', border: '1px solid #444' }} onClick={() => setActiveIdx(idx)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className='mt-2 d-grid' style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {previewProductos.map(p => {
                const cfg = getCfg(p.id)
                return (
                  <div key={p.id} className='rounded p-3' style={{ background: 'rgb(18, 30, 130)', color: 'white' }}>
                    <div className='fw-bold' style={{ color: 'white' }}>{cfg.tituloPersonalizado || p.nombre}</div>
                    <div className='' style={{ minHeight: 40, color: 'rgba(255,255,255,0.85)' }}>{cfg.descripcionPersonalizada || p.descripcion}</div>
                    <div className='' style={{ color: '#FFD966' }}>${Number(p.precio).toFixed(2)}</div>
                    {cfg.palabrasClave && <div className='fs-8 mt-1' style={{ color: 'rgba(255,255,255,0.7)' }}>#{cfg.palabrasClave?.split(',').map(s => s.trim()).filter(Boolean).join(' #')}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Modales Carrusel */}
        {(modalType === 'createItem' || modalType === 'editItem') && (
          <ModalDialog
            title={modalType === 'createItem' ? 'Agregar Slide' : 'Editar Slide'}
            textBtn='Guardar'
            content={
              <div style={grid2ColStyle}>
                <div className='form-group' style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className='form-label'>Imagen</label>
                  <input type='file' className='form-control' onChange={(e) => setImagenFile(e.target.files?.[0] || null)} />
                </div>
                <div className='form-group'>
                  <label style={{ color: 'white' }} className='form-label'>Título</label>
                  <input className='form-control' value={editedItem.titulo || ''} onChange={(e) => setEditedItem(prev => ({ ...prev, titulo: e.target.value }))} />
                </div>
                <div className='form-group'>
                  <label style={{ color: 'white' }} className='form-label'>Color del Título</label>
                  <input type='color' className='form-control form-control-color' value={editedItem.tituloColor || '#ffffff'} onChange={(e) => setEditedItem(prev => ({ ...prev, tituloColor: e.target.value }))} />
                </div>
                <div className='form-group'>
                  <label style={{ color: 'white' }} className='form-label'>Intervalo (ms)</label>
                  <input type='number' min={500} step={100} className='form-control' value={editedItem.intervaloMs ?? 3000} onChange={(e) => setEditedItem(prev => ({ ...prev, intervaloMs: Number(e.target.value) }))} />
                </div>
                <div className='form-group' style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className='form-label'>Descripción</label>
                  <textarea className='form-control' rows={2} value={editedItem.descripcion || ''} onChange={(e) => setEditedItem(prev => ({ ...prev, descripcion: e.target.value }))} />
                </div>
                <div className='form-group'>
                  <label style={{ color: 'white' }} className='form-label'>Orden</label>
                  <input type='number' className='form-control' value={editedItem.orden ?? 0} onChange={(e) => setEditedItem(prev => ({ ...prev, orden: Number(e.target.value) }))} />
                </div>
                <div className='form-group d-flex align-items-center gap-2'>
                  <input type='checkbox' className='form-check-input' checked={!!editedItem.activo} onChange={() => setEditedItem(prev => ({ ...prev, activo: !prev.activo }))} />
                  <span className='text-white'>Activo</span>
                </div>
              </div>
            }
            onConfirm={() => { modalType === 'createItem' ? createItem() : updateItem() }}
            closeModal={() => { closeModal() }}
          />
        )}

        {modalType === 'deleteItem' && (
          <ModalDialog
            title='Eliminar Slide'
            textBtn='Eliminar'
            confirmButtonClass='btn-danger'
            content={<div className='text-white'>¿Está seguro que desea eliminar este slide?</div>}
            onConfirm={deleteItem}
            closeModal={closeModal}
          />
        )}
      </div>
    </div>
  )
}
