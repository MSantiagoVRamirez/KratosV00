import axios from 'axios'
import APIurls from '../APIurls'
import { POSItem } from '../../interfaces/Ventas/POS'

const API_URL = APIurls.Currennt_API_URL + '/api/POS'
axios.defaults.withCredentials = true

const leerPorVenta = (ventaId: number) => axios.get(`${API_URL}/leerPorVenta`, { params: { ventaId } })
const insertar = (data: POSItem) => axios.post(`${API_URL}/insertar`, data)
const editar = (data: POSItem) => axios.put(`${API_URL}/editar`, data)
const eliminar = (id: number) => axios.delete(`${API_URL}/eliminar`, { params: { id } })

export default { leerPorVenta, insertar, editar, eliminar }

