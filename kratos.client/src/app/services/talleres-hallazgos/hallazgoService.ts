import axios from "axios";
import { Hallazgo } from "../../interfaces/talleres-hallazgos/Hallazgo";
import APIurls from "../APIurls";

const API_URL = APIurls.Currennt_API_URL + "/api/Hallazgo";

// Preservar estado de la sesión iniciada
axios.defaults.withCredentials = true;

const getAll = () => {
  return axios.get(`${API_URL}/leer`);
};

const get = (id: number) => {
  return axios.get(`${API_URL}/consultar`, { params: { Id: id } });
}

const create = (data: Hallazgo) => {
  return axios.post(`${API_URL}/insertar`, data);
};

const update = (data: Hallazgo) => {
  return axios.put(`${API_URL}/editar`, data);
}

const remove = (id: number) => {
  return axios.delete(`${API_URL}/eliminar`, { params: { Id: id } });
}

export default { getAll, get, create, update, remove };