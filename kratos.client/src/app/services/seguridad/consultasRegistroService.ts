import axios from "axios";
import APIurls from "../APIurls";

const API_URL = APIurls.Currennt_API_URL + "/api/ConsultasRegistro";

// Preservar estado de la sesión iniciada
axios.defaults.withCredentials = true;

const getActividadesEconomicas = () => {
    return axios.get(`${API_URL}/ListaActivdad`);
}

const getRegimenesTributarios = () => {
    return axios.get(`${API_URL}/ListaRegimenTributario`);
}
const getTiposSociedad = () => {
    return axios.get(`${API_URL}/ListaTipoSociedad`);
}
export default {getActividadesEconomicas, getRegimenesTributarios , getTiposSociedad};
