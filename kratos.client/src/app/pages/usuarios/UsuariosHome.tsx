import { useEffect, useMemo, useState } from 'react'
import '../../Styles/estilos.css'
import empresaService from '../../services/seguridad/empresaService'
import POSService from '../../services/Ventas/POSService'
import { useAuth } from '../../modules/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import APIurls from '../../services/APIurls'

type EmpresaCard = {
  id: number
  razonSocial: string
  nombreComercial?: string | null
  telefono: string
  email: string
  ImagenUrl?: string | null
}

type TopProducto = {
  productoId: number
  nombre: string
  codigo: string
  imagenUrl?: string | null
  totalCantidad: number
  totalVentas: number
}

export function UsuariosHome() {
  const { roleId } = useAuth()
  const navigate = useNavigate()
  const [empresas, setEmpresas] = useState<EmpresaCard[]>([])
  const [topProductos, setTopProductos] = useState<TopProducto[]>([])
  const [search, setSearch] = useState('')

  // Resolver robusto para URLs de imagen (absolutas o relativas)
  const apiBaseAxios = (axiosInstance as any)?.defaults?.baseURL || ''
  const apiBase = apiBaseAxios ? String(apiBaseAxios).replace(/\/api\/?$/, '') : ''
  const configBase = (APIurls?.Currennt_API_URL || '').replace(/\/api\/?$/, '')
  const originBase = (typeof window !== 'undefined' ? window.location.origin : '')
  const baseCandidate = apiBase || configBase || originBase
  const resolveImg = (url?: string | null): string => {
    if (!url) return ''
    let s = String(url).trim()
    s = s.replace(/\\/g, '/')
    if (/^https?:\/\//i.test(s)) return s
    s = s.replace(/^\/+/, '')
    if (!baseCandidate) return '/' + s
    return `${baseCandidate}/${s}`
  }
  const fallbackImg = '/media/avatars/Empresa.png'
  const getImg = (url?: string | null | undefined, alt?: any) => {
    // Aceptar variantes de nombre: ImagenUrl / imagenUrl
    const raw = url ?? (typeof alt === 'string' ? alt : (alt?.imagenUrl ?? alt?.ImagenUrl))
    const src = resolveImg(raw as any)
    return src || fallbackImg
  }

  // Paginación (empresas y productos)
  const [empPage, setEmpPage] = useState(1)
  const [empPerPage, setEmpPerPage] = useState(8)
  const [prodPage, setProdPage] = useState(1)
  const [prodPerPage, setProdPerPage] = useState(8)

  useEffect(() => {
    empresaService.getAll()
      .then(res => setEmpresas(Array.isArray(res.data) ? res.data : []))
      .catch(() => setEmpresas([]))
    POSService.topProductos(8)
      .then(res => setTopProductos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTopProductos([]))
  }, [])

  const filtro = useMemo(() => {
    const q = (search || '').toLowerCase()
    if (!q) return empresas
    return empresas.filter(e => (
      (e.razonSocial || '').toLowerCase().includes(q) ||
      (e.nombreComercial || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.telefono || '').toLowerCase().includes(q)
    ))
  }, [empresas, search])

  const empresasPaginadas = useMemo(() => {
    const start = (empPage - 1) * empPerPage
    return filtro.slice(start, start + empPerPage)
  }, [filtro, empPage, empPerPage])

  const topProductosPaginados = useMemo(() => {
    const start = (prodPage - 1) * prodPerPage
    return topProductos.slice(start, start + prodPerPage)
  }, [topProductos, prodPage, prodPerPage])

  if (roleId !== 1) {
    return (
      <div className='contenido'>
        <div className='bloque-formulario'>
          <h2>Inicio</h2>
          <div className='text-muted'>Esta vista está disponible para usuarios con rol 1.</div>
        </div>
      </div>
    )
  }

  return (
    <div className='contenido'>
      <div className='bloque-formulario'>
        <div className='d-flex justify-content-between align-items-center'>
          <h2>Empresas</h2>
          <input className='form-control' style={{ maxWidth: 320 }} placeholder='Buscar empresa...' value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Grid de empresas */}
        <div className='mt-4 d-grid' style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {empresasPaginadas.map(e => (
            <div
              key={e.id}
              className='border border-1 border-gray-300 rounded p-3 card-hover'
              style={{ background: 'rgb(185, 185, 197)', cursor: 'pointer' }}
              onClick={() => navigate(`/vitrina/empresa/${e.id}`)}
            >
              <div style={{ display: 'flex', gap: 12 }}>
                <img src={getImg(e.ImagenUrl, e)} alt={e.razonSocial}
                  onError={(ev: any) => { if (ev?.currentTarget) ev.currentTarget.src = fallbackImg }}
                  style={{ width: 64, height: 64, objectFit: 'cover', background: '#222', borderRadius: 8 }} />
                <div className='flex-grow-1'>
                  <div className='fw-bold' style={{ color: '#111' }}>{e.razonSocial}</div>
                  {e.nombreComercial && <div className='' style={{ color: '#333' }}>{e.nombreComercial}</div>}
                  <div className='' style={{ fontSize: 12, color: '#222' }}>{e.email} • {e.telefono}</div>
                </div>
              </div>
            </div>
          ))}
          {filtro.length === 0 && (
            <div className='text-muted'>No hay empresas para mostrar.</div>
          )}
        </div>

        {/* Paginación Empresas */}
        <div className='d-flex justify-content-end align-items-center gap-2 mt-3'>
          <span className='text-muted'>Por página</span>
          <select className='form-select form-select-sm' style={{ width: 80 }} value={empPerPage} onChange={(e) => { setEmpPerPage(Number(e.target.value)); setEmpPage(1) }}>
            <option value={3}>3</option>
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={15}>15</option>
          </select>
          <button className='btn btn-sm btn-light' disabled={empPage <= 1} onClick={() => setEmpPage(p => Math.max(1, p - 1))}>Prev</button>
          <span className='text-muted'>Página {empPage} / {Math.max(1, Math.ceil(filtro.length / empPerPage))}</span>
          <button className='btn btn-sm btn-light' disabled={empPage >= Math.ceil(filtro.length / empPerPage)} onClick={() => setEmpPage(p => p + 1)}>Next</button>
        </div>

        {/* Top productos */}
        <div className='mt-6'>
          <h3>Productos más vendidos</h3>
          <div className='mt-3 d-grid' style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {topProductosPaginados.map(p => (
              <div key={p.productoId} className='rounded p-3 card-hover' style={{ background: 'rgb(185, 185, 197)', color: '#111' }}>
                <div className='d-flex align-items-center gap-2'>
                  <img src={getImg(p.imagenUrl)} alt={p.nombre}
                    onError={(ev: any) => { if (ev?.currentTarget) ev.currentTarget.src = fallbackImg }}
                    style={{ width: 48, height: 48, objectFit: 'cover', background: '#222', borderRadius: 6 }} />
                  <div>
                    <div className='fw-bold' style={{ color: '#111' }}>{p.nombre}</div>
                    <div className='' style={{ color: '#333' }}>({p.codigo})</div>
                  </div>
                </div>
                <div className='mt-2' style={{ color: '#333' }}>Unidades: {p.totalCantidad}</div>
                <div className='' style={{ color: '#222' }}>Ventas: ${Number(p.totalVentas).toFixed(2)}</div>
              </div>
            ))}
            {topProductos.length === 0 && (
              <div className='text-muted'>No hay datos de ventas disponibles.</div>
            )}
          </div>

          {/* Paginación Productos */}
          <div className='d-flex justify-content-end align-items-center gap-2 mt-3'>
            <span className='text-muted'>Por página</span>
            <select className='form-select form-select-sm' style={{ width: 80 }} value={prodPerPage} onChange={(e) => { setProdPerPage(Number(e.target.value)); setProdPage(1) }}>
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
            </select>
            <button className='btn btn-sm btn-light' disabled={prodPage <= 1} onClick={() => setProdPage(p => Math.max(1, p - 1))}>Prev</button>
            <span className='text-muted'>Página {prodPage} / {Math.max(1, Math.ceil(topProductos.length / prodPerPage))}</span>
            <button className='btn btn-sm btn-light' disabled={prodPage >= Math.ceil(topProductos.length / prodPerPage)} onClick={() => setProdPage(p => p + 1)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
