import axios from "axios"
import APIurls from '../APIurls';

const API_URL = APIurls.Currennt_API_URL + '/api/SECS';

// Preservar estado de la sesión iniciada
axios.defaults.withCredentials = true;

const calcSECSByODSId = (odsId: number) => {
  return axios.post(`${API_URL}/CalculoSecs`, { odsId: odsId });
}

const getCalPromByContratoId = (contratoId: number) => {
  return axios.get(`${API_URL}/CalificacionPromedioSECSContrato`, { params: { contratoId: contratoId } });
}

const getCalPromByODSId = (odsId: number) => {
  return axios.get(`${API_URL}/CalificacionPromedioSECSODS`, { params: { odsId: odsId } });
}

const getSECS = (odsId: number) => {
  return axios.get(`${API_URL}/leerIndicadores`, { params: { odsId: odsId } });
}

const getSECSByODSId = (odsId: number) => {
  return axios.get(`${API_URL}/ConsultarIndicadorSECS`, { params: { odsId: odsId } });
}

export default { calcSECSByODSId, getCalPromByContratoId, getCalPromByODSId, getSECSByODSId, getSECS };