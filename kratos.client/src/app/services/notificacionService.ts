import axios from "axios";
// import { Notificacion } from "../interfaces/Notificacion";
import APIurls from "./APIurls";

const API_URL = APIurls.Currennt_API_URL + "/api/Notificacion";

// Preservar estado de la sesión iniciada
axios.defaults.withCredentials = true;

const getAll = () => {
  return axios.get(`${API_URL}/getNotificacion`);
}

const markAsRead = (id: number) => {
  return axios.put(`${API_URL}/notificacionLeida`, null, { params: { Id: id } });
}

export default { getAll, markAsRead };