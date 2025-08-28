import axios from 'axios'
import APIurls from '../APIurls'
import { Inventario } from '../../interfaces/Ventas/Inventario'

const API_URL = APIurls.Currennt_API_URL + '/api/Inventarios'

axios.defaults.withCredentials = true

const leer = () => {
  return axios.get(`${API_URL}/leer`)
}

const consultar = (id: number) => {
  return axios.get(`${API_URL}/consultar`, { params: { id } })
}

const insertar = (data: Inventario) => {
  return axios.post(`${API_URL}/insertar`, data)
}

const editar = (data: Inventario) => {
  return axios.put(`${API_URL}/editar`, data)
}

const eliminar = (id: number) => {
  return axios.delete(`${API_URL}/eliminar`, { params: { Id: id } })
}

export default { leer, consultar, insertar, editar, eliminar }

