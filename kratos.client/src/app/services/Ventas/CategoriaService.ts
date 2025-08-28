import axios from 'axios';
import APIurls from '../APIurls';

const API_URL = APIurls.Currennt_API_URL + '/api/Categorias';

// Preservar estado de la sesión iniciada
axios.defaults.withCredentials = true;

const getCategoriasProductos = () => {
  return axios.get(`${API_URL}/leerCategoriaProducto`);
}

const getSubCategoriasProductos = (categoriaId: number) => {
  return axios.get(`${API_URL}/leerSubCategoriaProducto`, {
    params: { categoria: categoriaId },
  });
};

const getCategoriasServicios = () => {
  return axios.get(`${API_URL}/leerCategoriaServicio`);
}

const getSubCategoriasServicios = (categoriaId: number) => {
  return axios.get(`${API_URL}/leerSubCategoriaProducto`, {
    params: { categoria: categoriaId },
  });
};

export default { getCategoriasProductos, getSubCategoriasProductos, getCategoriasServicios ,getSubCategoriasServicios };