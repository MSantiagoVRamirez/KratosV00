import axios from 'axios';
import { Usuario } from '../../interfaces/Configuracion/Usuario';
import APIurls from '../APIurls';

const API_URL = APIurls.Currennt_API_URL + '/api/Usuarios';

function toFormData(usuario: Usuario): FormData {
  const fd = new FormData();
  // Asegúrate de que los nombres coincidan con tu binding en el backend
  fd.append('id', String(usuario.id ?? 0));
  fd.append('rolesId', String(usuario.rolesId ?? 0));
  fd.append('contraseña', usuario.contraseña ?? '');
  fd.append('confirmarContraseña', usuario.confirmarContraseña ?? '');
  fd.append('token', usuario.token ?? '');
  fd.append('email', usuario.email ?? '');
  fd.append('nombres', usuario.nombres ?? '');
  fd.append('apellidos', usuario.apellidos ?? '');
  fd.append('telefono', usuario.telefono ?? '');
  fd.append('estado', String(usuario.estado ?? false));
  if (usuario.creadoEn) fd.append('creadoEn', usuario.creadoEn);
  if (usuario.actualizadoEn) fd.append('actualizadoEn', usuario.actualizadoEn);
  if (usuario.imagenArchivo) fd.append('ImagenArchivo', usuario.imagenArchivo); // respeta el nombre del backend
  if (usuario.imagenUrl) fd.append('ImagenUrl', usuario.imagenUrl);
  return fd;
}

// Preservar estado de la sesión iniciada
axios.defaults.withCredentials = true;

const getAll = () => {
  return axios.get(`${API_URL}/leer`);
}

const get = (id: number) => {
  return axios.get(`${API_URL}/consultar`, { params: { 'Id': id } });
}

const create = (data: Usuario) => {
  const formData = toFormData(data);
  return axios.post(`${API_URL}/insertar`, formData);
}

const update = (data: Usuario) => {
  const formData = toFormData(data);
  return axios.put(`${API_URL}/editar`, formData);
}

const remove = (id: number) => {
  return axios.delete(`${API_URL}/eliminar`, { params: { 'Id': id } });
}

export default { getAll, get, create, update, remove };