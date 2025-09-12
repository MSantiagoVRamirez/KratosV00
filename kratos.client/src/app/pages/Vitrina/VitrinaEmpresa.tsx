import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import '../../Styles/estilos.css'
import CatalogoService from '../../services/Ventas/CatalogoService'
import ProductoService from '../../services/Ventas/ProductoService'
import axiosInstance from '../../api/axiosInstance'

type Producto = {
  id: number
  codigo: string
  nombre: string
  descripcion: string
  precio: number
  ImagenUrl?: string | null
  imagenUrl?: string | null
  productoServicio?: boolean
}

type CatalogoItemCarrusel = {
  id: number
  titulo?: string | null
  descripcion?: string | null
  tituloColor?: string | null
  imagenUrl?: string | null
  orden: number
  intervaloMs?: number
  activo: boolean
}

type CatalogoProductoConfig = {
  productoId: number
  visible: boolean
  tituloPersonalizado?: string | null
  descripcionPersonalizada?: string | null
  palabrasClave?: string | null
}

export function VitrinaEmpresa() {
  const { empresaId } = useParams<{ empresaId: string }>()
  const empresa = Number(empresaId || 0)

  const [slidesProd, setSlidesProd] = useState<CatalogoItemCarrusel[]>([])
  const [slidesServ, setSlidesServ] = useState<CatalogoItemCarrusel[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [servicios, setServicios] = useState<Producto[]>([])
  const [configs, setConfigs] = useState<CatalogoProductoConfig[]>([])
  const [activeProd, setActiveProd] = useState(0)
  const [activeServ, setActiveServ] = useState(0)

  const apiBaseAxios = (axiosInstance as any)?.defaults?.baseURL || ''
  const apiBase = apiBaseAxios ? String(apiBaseAxios).replace(/\/api\/?$/, '') : ''
  const resolveImg = (url?: string | null): string => {
    if (!url) return ''
    let s = String(url).trim().replace(/\\/g, '/')
    if (/^https?:\/\//i.test(s)) return s
    s = s.replace(/^\/+/, '')
    return apiBase ? `${apiBase}/${s}` : '/' + s
  }
  const fallback = '/media/avatars/300-1.jpg'
  const getImg = (p: any) => resolveImg(p?.ImagenUrl ?? p?.imagenUrl)

  useEffect(() => {
    if (!empresa) return
    CatalogoService.leerCarrusel(empresa, 'productos').then(res => setSlidesProd((Array.isArray(res.data) ? res.data : []).filter((s: any) => s.activo).sort((a: any, b: any) => a.orden - b.orden)))
    CatalogoService.leerCarrusel(empresa, 'servicios').then(res => setSlidesServ((Array.isArray(res.data) ? res.data : []).filter((s: any) => s.activo).sort((a: any, b: any) => a.orden - b.orden)))
    ProductoService.leer().then(res => setProductos((Array.isArray(res.data) ? res.data : []).filter((p: any) => p.productoServicio === false)))
    CatalogoService.leerServicios().then(res => setServicios(Array.isArray(res.data) ? res.data : []))
    CatalogoService.leerProductosConfig(empresa).then(res => setConfigs(Array.isArray(res.data) ? res.data : []))
  }, [empresa])

  // Auto avance carousels
  useEffect(() => {
    if (slidesProd.length === 0) return
    const curr = slidesProd[activeProd]
    const t = Math.max(1000, Number(curr?.intervaloMs || 3000))
    const id = setTimeout(() => setActiveProd(p => (p + 1) % slidesProd.length), t)
    return () => clearTimeout(id)
  }, [slidesProd, activeProd])
  useEffect(() => {
    if (slidesServ.length === 0) return
    const curr = slidesServ[activeServ]
    const t = Math.max(1000, Number(curr?.intervaloMs || 3000))
    const id = setTimeout(() => setActiveServ(p => (p + 1) % slidesServ.length), t)
    return () => clearTimeout(id)
  }, [slidesServ, activeServ])

  const cfgMap = useMemo(() => {
    const m = new Map<number, CatalogoProductoConfig>()
    configs.forEach(c => m.set(c.productoId, c))
    return m
  }, [configs])

  const productosVisibles = useMemo(() => productos.filter(p => (cfgMap.get(p.id)?.visible ?? true)), [productos, cfgMap])
  const serviciosVisibles = useMemo(() => servicios.filter(s => (cfgMap.get(s.id)?.visible ?? true)), [servicios, cfgMap])

  return (
    <div className='contenido'>
      <div className='bloque-formulario'>
        {/* Carrusel Productos */}
        <div className='mb-6'>
          <h3 className='text-white'>Destacados de Productos</h3>
          <div className='position-relative' style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
            {slidesProd.length > 0 ? (
              <div className='border border-1 border-gray-300 rounded card-hover' key={slidesProd[activeProd].id}>
                <div style={{ position: 'relative' }}>
                  <img src={resolveImg(slidesProd[activeProd].imagenUrl)} alt={slidesProd[activeProd].titulo || ''} onError={(e: any) => { e.currentTarget.src = fallback }} style={{ width: '100%', height: 320, objectFit: 'cover', background: '#222' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 12, color: slidesProd[activeProd].tituloColor || '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontSize: 20, fontWeight: 700 }}>{slidesProd[activeProd].titulo}</div>
                </div>
                <div className='p-2 text-muted'>{slidesProd[activeProd].descripcion}</div>
              </div>
            ) : (
              <div className='text-muted'>Sin slides de productos.</div>
            )}
          </div>
        </div>

        {/* Productos */}
        <div className='mt-3'>
          <h3 className='text-white'>Productos</h3>
          <div className='d-grid' style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {productosVisibles.map(p => {
              const cfg = cfgMap.get(p.id)
              return (
                <div key={p.id} className='rounded p-3 card-hover' style={{ background: 'rgb(185, 185, 197)', color: '#111' }}>
                  <div className='d-flex align-items-center gap-2'>
                    <img src={getImg(p) || fallback} onError={(e: any) => { e.currentTarget.src = fallback }} alt={p.nombre} style={{ width: 56, height: 56, objectFit: 'cover', background: '#222', borderRadius: 6 }} />
                    <div>
                      <div className='fw-bold'>{cfg?.tituloPersonalizado || p.nombre}</div>
                      <div className='' style={{ color: '#333' }}>({p.codigo})</div>
                    </div>
                  </div>
                  <div className='mt-2' style={{ color: '#222' }}>{cfg?.descripcionPersonalizada || p.descripcion}</div>
                  <div style={{ color: '#111' }}>${Number(p.precio).toFixed(2)}</div>
                  {cfg?.palabrasClave && <div className='fs-8 mt-1' style={{ color: '#444' }}>#{cfg.palabrasClave.split(',').map(s => s.trim()).filter(Boolean).join(' #')}</div>}
                </div>
              )
            })}
            {productosVisibles.length === 0 && <div className='text-muted'>Sin productos visibles.</div>}
          </div>
        </div>

        {/* Carrusel Servicios */}
        <div className='mb-6 mt-8'>
          <h3 className='text-white'>Destacados de Servicios</h3>
          <div className='position-relative' style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
            {slidesServ.length > 0 ? (
              <div className='border border-1 border-gray-300 rounded card-hover' key={slidesServ[activeServ].id}>
                <div style={{ position: 'relative' }}>
                  <img src={resolveImg(slidesServ[activeServ].imagenUrl)} alt={slidesServ[activeServ].titulo || ''} onError={(e: any) => { e.currentTarget.src = fallback }} style={{ width: '100%', height: 320, objectFit: 'cover', background: '#222' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 12, color: slidesServ[activeServ].tituloColor || '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontSize: 20, fontWeight: 700 }}>{slidesServ[activeServ].titulo}</div>
                </div>
                <div className='p-2 text-muted'>{slidesServ[activeServ].descripcion}</div>
              </div>
            ) : (
              <div className='text-muted'>Sin slides de servicios.</div>
            )}
          </div>
        </div>

        {/* Servicios */}
        <div className='mt-3'>
          <h3 className='text-white'>Servicios</h3>
          <div className='d-grid' style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {serviciosVisibles.map(s => {
              const cfg = cfgMap.get(s.id)
              return (
                <div key={s.id} className='rounded p-3 card-hover' style={{ background: 'rgb(185, 185, 197)', color: '#111' }}>
                  <div className='fw-bold'>{cfg?.tituloPersonalizado || s.nombre}</div>
                  <div className='' style={{ color: '#222' }}>{cfg?.descripcionPersonalizada || s.descripcion}</div>
                  <div style={{ color: '#111' }}>${Number(s.precio).toFixed(2)}</div>
                  {cfg?.palabrasClave && <div className='fs-8 mt-1' style={{ color: '#444' }}>#{cfg.palabrasClave.split(',').map(t => t.trim()).filter(Boolean).join(' #')}</div>}
                </div>
              )
            })}
            {serviciosVisibles.length === 0 && <div className='text-muted'>Sin servicios visibles.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

