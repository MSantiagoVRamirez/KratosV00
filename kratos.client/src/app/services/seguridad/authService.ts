import axios from "axios";
import { Usuario } from "../../interfaces/seguridad/Usuario";
import APIurls from "../APIurls";

const API_URL = APIurls.Currennt_API_URL + "/api/Login";

// Preservar estado de la sesión iniciada
axios.defaults.withCredentials = true;

const login = (usuario: string, password: string) => {
  return axios.post(`${API_URL}/iniciarSesion`, { "usuario": usuario, "password": password });
}

const register = (data: Usuario) => {
  return axios.post(`${API_URL}/registroUsuario`, data);
}

const logout = () => {
  return axios.post(`${API_URL}/cerrarSesion`);
}

const consultar = (usuario: string) => {
  return axios.get(`${API_URL}/consultar`, { params: { "nombreUsuario": usuario } });
}

const leerEmpresa = () => {
  return axios.get(`${API_URL}/leerEmpresa`);
}

export default { login, register, logout, consultar, leerEmpresa };