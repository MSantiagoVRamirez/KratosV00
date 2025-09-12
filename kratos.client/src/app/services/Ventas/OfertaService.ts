import axios from 'axios'
import APIurls from '../APIurls'
import { Oferta } from '../../interfaces/Ventas/Oferta'

const API_URL = APIurls.Currennt_API_URL + '/api/Ofertas'

axios.defaults.withCredentials = true

const getAll = (empresaId?: number) => {
  const params: any = {}
  if (empresaId) params.empresaId = empresaId
  return axios.get(`${API_URL}/leer`, { params })
}

const get = (id: number) => {
  return axios.get(`${API_URL}/consultar`, { params: { Id: id } })
}

const create = (data: Oferta) => {
  return axios.post(`${API_URL}/insertar`, data)
}

const update = (data: Oferta) => {
  return axios.put(`${API_URL}/editar`, data)
}

const remove = (id: number) => {
  return axios.delete(`${API_URL}/eliminar`, { params: { Id: id } })
}

export default { getAll, get, create, update, remove }

