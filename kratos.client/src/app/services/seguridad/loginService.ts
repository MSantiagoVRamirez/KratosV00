import axios from "axios";
//import { Usuario } from "../../interfaces/seguridad/Usuario";
import { Empresa } from "../../interfaces/seguridad/Empresa";
import APIurls from "../APIurls";

const API_URL = APIurls.Currennt_API_URL + "/api/Login";

// Preservar estado de la sesión iniciada
axios.defaults.withCredentials = true;

// Opción clara usando params:
const loginEmpresa = (email: string, contraseña: string) => {
  return axios.post(
    `${API_URL}/iniciarSesion`,
    { email, contraseña },              
    { params: { tipoLogin: 1 } }
  );
};

const loginUsuario = (email: string, contraseña: string) => {
  return axios.post(
    `${API_URL}/iniciarSesion`,
    { email, contraseña },              
    { params: { tipoLogin: 2 } }
  );
};

const registroEmpresa = (data: Empresa) => {
  return axios.post(`${API_URL}/registroEmpresa`, data);
}

const logout = () => {
  return axios.post(`${API_URL}/cerrarSesion`);
}

export default { loginEmpresa, loginUsuario, registroEmpresa, logout };