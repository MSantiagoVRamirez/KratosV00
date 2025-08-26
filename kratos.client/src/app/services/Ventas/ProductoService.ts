// services/Ventas/ProductoService.ts
import axios from 'axios';
import APIurls from '../APIurls';
import { Producto } from '../../interfaces/Ventas/Producto';

const API_URL = APIurls.Currennt_API_URL + '/api/Productos';
axios.defaults.withCredentials = true;

function toFormData(p: Producto): FormData {
  const fd = new FormData();

  // Básicos
  if (p.id != null) fd.append('id', String(p.id));
  fd.append('codigo', p.codigo ?? '');
  fd.append('nombre', p.nombre ?? '');
  fd.append('descripcion', p.descripcion ?? '');

  // Llaves
  fd.append('categoriaId', String(p.categoriaId ?? 0));
  fd.append('subCategoriaId', String(p.subCategoriaId ?? 0));

  // Números (decimal/int)
  fd.append('precio', String(p.precio ?? 0));
  fd.append('costo', String(p.costo ?? 0));
  fd.append('stockMinimo', String(p.stockMinimo ?? 0));

  // Estado
  fd.append('activo', String(p.activo ?? false));

  // Imagen: si hay archivo, va como ImagenArchivo; si no, intentamos URL/string
  if (p.ImagenArchivo) {
    fd.append('ImagenArchivo', p.ImagenArchivo);
  } else {
    // Mando ambas variantes por compatibilidad con tu back
    if (p.ImagenUrl) fd.append('ImagenUrl', p.ImagenUrl);
    if (p.imagenUrl) fd.append('imagenUrl', p.imagenUrl);
  }

  // Opcionales de fecha (no obligatorios en insertar/editar)
  if (p.creadoEn) fd.append('creadoEn', p.creadoEn);
  if (p.actualizadoEn) fd.append('actualizadoEn', p.actualizadoEn);

  return fd;
}

const insertar = (producto: Producto) => {
  return axios.post(`${API_URL}/insertar`, toFormData(producto), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const leer = () => axios.get(`${API_URL}/leer`);

const consultar = (id: number) =>
  axios.get(`${API_URL}/consultar`, { params: { id } });

const editar = (producto: Producto) => {
  return axios.put(`${API_URL}/editar`, toFormData(producto), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const eliminar = (id: number) =>
  axios.delete(`${API_URL}/eliminar`, { params: { id } });

export default { insertar, leer, consultar, editar, eliminar };
