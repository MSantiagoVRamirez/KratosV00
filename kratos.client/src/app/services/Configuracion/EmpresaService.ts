// services/Configuracion/EmpresaService.ts
import axios from 'axios';
import APIurls from '../APIurls';
import { Empresa } from '../../interfaces/Configuracion/Empresa';

const API_URL = APIurls.Currennt_API_URL + '/api/Empresa';
axios.defaults.withCredentials = true;

const toFormData = (e: Empresa, imagenFile?: File | null) => {
  const fd = new FormData();
  fd.append('id', String(e.id));
  fd.append('tiposociedadId', String(e.tiposociedadId));
  fd.append('actividadId', String(e.actividadId));
  fd.append('regimenId', String(e.regimenId));

  fd.append('razonSocial', e.razonSocial ?? '');
  fd.append('nombreComercial', e.nombreComercial ?? '');
  fd.append('nit', e.nit ?? '');
  fd.append('dv', e.dv ?? '');
  fd.append('telefono', e.telefono ?? '');
  fd.append('email', e.email ?? '');
  fd.append('representanteLegal', e.representanteLegal ?? '');

  fd.append('activo', String(e.activo));

  // Imagen: archivo tiene prioridad; si no hay archivo, puedes mandar ImagenUrl
  if (imagenFile) fd.append('ImagenArchivo', imagenFile);
  else if (e.imagenUrl) fd.append('ImagenUrl', e.imagenUrl);

  return fd;
};

const get = () => axios.get(`${API_URL}/consultar`);
const update = (data: Empresa, imagenFile?: File | null) =>
  axios.put(`${API_URL}/editar`, toFormData(data, imagenFile), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
const getAll = () => axios.get(`${API_URL}/leer`);

export default { get, update, getAll };
