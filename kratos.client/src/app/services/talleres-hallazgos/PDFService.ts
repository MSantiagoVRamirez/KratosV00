import axios from "axios";
import APIurls from "../APIurls";

const API_URL = APIurls.Currennt_API_URL + "/api/pdf";

// Preservar estado de la sesión iniciada
axios.defaults.withCredentials = true;

const getPDF = (id: number) => {
  return axios.get(`${API_URL}/taller`, { params: { taller: id }, responseType: 'blob' });
};

export default { getPDF };