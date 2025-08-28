import axios from 'axios'
import APIurls from '../APIurls'
import { Venta } from '../../interfaces/Ventas/Venta'

const API_URL = APIurls.Currennt_API_URL + '/api/Ventas'
axios.defaults.withCredentials = true

const crearPendiente = (data: {
  puntoVentaId: number
  clienteId?: number | null
  vendedorId?: number | null
  numeroFactura?: string | null
  tipoVenta?: number
  tipoPago?: number
}) => axios.post(`${API_URL}/crearPendiente`, data)

const leerPendientes = (puntoVentaId?: number) => axios.get(`${API_URL}/leerPendientes`, { params: { puntoVentaId } })
const leer = () => axios.get(`${API_URL}/leer`)
const leerContinuables = (puntoVentaId?: number) => axios.get(`${API_URL}/leerContinuables`, { params: { puntoVentaId } })

const consultar = (id: number) => axios.get(`${API_URL}/consultar`, { params: { id } })

const finalizar = (ventaId: number, siguienteEstado: 'Pagada' | 'PorCobrar') =>
  axios.post(`${API_URL}/finalizarConInventario`, { ventaId, siguienteEstado })

const cancelar = (ventaId: number) => axios.post(`${API_URL}/cancelar`, { ventaId })
const reabrir = (ventaId: number) => axios.post(`${API_URL}/reabrir`, { ventaId })

export default { crearPendiente, leerPendientes, leerContinuables, leer, consultar, finalizar, cancelar, reabrir }
