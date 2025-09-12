import axios from 'axios'
import APIurls from '../services/APIurls'

const axiosInstance = axios.create({
  baseURL: APIurls.Currennt_API_URL + '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export default axiosInstance
