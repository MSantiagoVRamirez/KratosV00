import axios from "axios";
import APIurls from "../APIurls";

const API_URL = APIurls.Currennt_API_URL + "/api/ResetPassword";

// Preservar estado de la sesión iniciada
axios.defaults.withCredentials = true;

const editarPassword = (nombreUsuario: string, data: { password: string; confirmPassword: string }) => {
  return axios.put(`${API_URL}/editar?nombreUsuario=${nombreUsuario}`, data);
}

export default { editarPassword };