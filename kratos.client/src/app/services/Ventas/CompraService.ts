import axios from 'axios'
import APIurls from '../APIurls'
import { TipoCompra, TipoPagoCompra } from '../../interfaces/Ventas/Compra'

const API_URL = APIurls.Currennt_API_URL + '/api/Compra'
axios.defaults.withCredentials = true

const crearPendiente = (data: {
  puntoVentaId: number
  proveedorId?: number | null
  solicitanteId?: number | null
  numeroFactura?: string | null
  tipoCompra?: TipoCompra
  tipoPago?: TipoPagoCompra
}) => axios.post(`${API_URL}/crearPendiente`, data)

const leerPendientes = (puntoVentaId?: number) => axios.get(`${API_URL}/leerPendientes`, { params: { puntoVentaId } })
const leer = () => axios.get(`${API_URL}/leer`)
const leerContinuables = (puntoVentaId?: number) => axios.get(`${API_URL}/leerContinuables`, { params: { puntoVentaId } })

const consultar = (id: number) => axios.get(`${API_URL}/consultar`, { params: { id } })

const finalizar = (compraId: number, siguienteEstado: 'Pagada' | 'PorCobrar') =>
  axios.post(`${API_URL}/finalizarConInventario`, { compraId, siguienteEstado })

const cancelar = (compraId: number) => axios.post(`${API_URL}/cancelar`, { compraId })
const reabrir = (compraId: number) => axios.post(`${API_URL}/reabrir`, { compraId })

export default { crearPendiente, leerPendientes, leerContinuables, leer, consultar, finalizar, cancelar, reabrir }

