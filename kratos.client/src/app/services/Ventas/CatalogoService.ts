import axios from 'axios'
import APIurls from '../APIurls'
import { CatalogoItemCarrusel, CatalogoProductoConfig } from '../../interfaces/Vitrina/Catalogo'

const API_URL = APIurls.Currennt_API_URL + '/api/Catalogo'
axios.defaults.withCredentials = true

// Carrusel
const leerCarrusel = (empresaId: number, seccion?: 'productos' | 'servicios') => axios.get(`${API_URL}/carousel/leer`, { params: { empresaId, seccion } })

const insertarCarrusel = (item: Partial<CatalogoItemCarrusel>, imagenFile?: File | null) => {
  const fd = new FormData()
  if (item.id != null) fd.append('id', String(item.id))
  fd.append('empresaId', String(item.empresaId))
  if (item.titulo) fd.append('titulo', item.titulo)
  if (item.descripcion) fd.append('descripcion', item.descripcion)
  if (item.tituloColor) fd.append('tituloColor', item.tituloColor)
  fd.append('orden', String(item.orden ?? 0))
  if (item.intervaloMs != null) fd.append('intervaloMs', String(item.intervaloMs))
  if (item.seccion) fd.append('seccion', item.seccion)
  fd.append('activo', String(item.activo ?? true))
  if (imagenFile) fd.append('ImagenArchivo', imagenFile)
  return axios.post(`${API_URL}/carousel/insertar`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}

const editarCarrusel = (item: Partial<CatalogoItemCarrusel>, imagenFile?: File | null) => {
  const fd = new FormData()
  if (item.id != null) fd.append('id', String(item.id))
  fd.append('empresaId', String(item.empresaId))
  if (item.titulo != null) fd.append('titulo', item.titulo)
  if (item.descripcion != null) fd.append('descripcion', item.descripcion)
  if (item.tituloColor != null) fd.append('tituloColor', item.tituloColor)
  fd.append('orden', String(item.orden ?? 0))
  if (item.intervaloMs != null) fd.append('intervaloMs', String(item.intervaloMs))
  if (item.seccion) fd.append('seccion', item.seccion)
  fd.append('activo', String(item.activo ?? true))
  if (imagenFile) fd.append('ImagenArchivo', imagenFile)
  return axios.put(`${API_URL}/carousel/editar`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}

const eliminarCarrusel = (id: number) => axios.delete(`${API_URL}/carousel/eliminar`, { params: { id } })

// Productos Config
const leerProductosConfig = (empresaId: number) => axios.get(`${API_URL}/productos/leerConfig`, { params: { empresaId } })
const guardarProductoConfig = (empresaId: number, cfg: CatalogoProductoConfig) => axios.put(`${API_URL}/productos/guardar`, cfg, { params: { empresaId } })
const leerServicios = () => axios.get(`${API_URL}/productos/leerServicios`)

export default { leerCarrusel, insertarCarrusel, editarCarrusel, eliminarCarrusel, leerProductosConfig, guardarProductoConfig, leerServicios }
