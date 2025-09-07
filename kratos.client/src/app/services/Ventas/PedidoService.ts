import axios from 'axios'
import APIurls from '../APIurls'
import { PedidoItem } from '../../interfaces/Ventas/Pedido'

const API_URL = APIurls.Currennt_API_URL + '/api/Pedidos'
axios.defaults.withCredentials = true

const leerPorCompra = (compraId: number) => axios.get(`${API_URL}/leerPorCompra`, { params: { compraId } })
const insertar = (data: PedidoItem) => axios.post(`${API_URL}/insertar`, data)
const editar = (data: PedidoItem) => axios.put(`${API_URL}/editar`, data)
const eliminar = (id: number) => axios.delete(`${API_URL}/eliminar`, { params: { id } })

export default { leerPorCompra, insertar, editar, eliminar }

