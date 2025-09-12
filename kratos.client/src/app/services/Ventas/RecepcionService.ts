import axios from 'axios'
import APIurls from '../APIurls'

const API_URL = APIurls.Currennt_API_URL + '/api/Recepciones'
axios.defaults.withCredentials = true

const ordenesPendientes = (puntoVentaId?: number) => axios.get(`${API_URL}/ordenesPendientes`, { params: { puntoVentaId } })
const usuariosPorCompra = (compraId: number) => axios.get(`${API_URL}/usuariosPorCompra`, { params: { compraId } })
const aplicar = (data: {
  compraId: number
  fechaHora?: string
  entregadoPor?: string
  usuarioId?: number
  detalles: { pedidoId: number; completo: boolean }[]
}) => axios.post(`${API_URL}/aplicar`, data)

export default { ordenesPendientes, usuariosPorCompra, aplicar }

