import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from '../../../api/axiosInstance';

//import '../../../Styles/estilos.css';

interface LoginProps {
  onLogin?: (data: any) => void;
}

function Login({ onLogin }: LoginProps) {
  const [credenciales, setCredenciales] = useState({ email: '', contraseña: '' });
  const [mensaje, setMensaje] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { invertAuth, saveUser, saveRole } = useAuth(); // Usamos el contexto de autenticación

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje('');

    try {
      const respuesta = await axios.post(
        '/Login/iniciarSesion?tipoLogin=1',
        credenciales,
        { withCredentials: true }
      );

      const data = respuesta.data;

      // Guardar usuario y rol si están presentes en la respuesta
      saveUser(data.nombreUsuario || credenciales.email);
      saveRole(data.rol || 'Usuario');
      invertAuth();

      if (onLogin) onLogin(data);
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMsg = error.response.data.message || error.response.data.error || 'Credenciales incorrectas.';
        setMensaje(errorMsg);
      } else {
        setMensaje('Error al iniciar sesión. Intenta nuevamente.');
      }
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <div style={{
      marginTop: '-3rem',
      color: 'white',
      padding: '0%',
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex'
    }}>
      <Box sx={{ maxWidth: 400, mt: 10, color: 'white' }}>
        <Typography variant="h5" sx={{
          textAlign: 'center',
          backgroundColor: 'rgb(20, 111, 165)',
          color: 'white',
          fontSize: '2.5rem'
        }}>
          Iniciar Sesión Como Empresa
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            margin="normal"
            value={credenciales.email}
            onChange={handleChange}
            required
            InputProps={{
              className: 'input-formulario-2',
              style: { color: 'white', backgroundColor: 'rgb(20, 111, 165)' }
            }}
            InputLabelProps={{
              className: 'label-formulario-2',
              style: { color: 'white' }
            }}
          />
          <TextField
            fullWidth
            label="Contraseña"
            name="contraseña"
            type={showPassword ? 'text' : 'password'}
            margin="normal"
            value={credenciales.contraseña}
            onChange={handleChange}
            required
            InputProps={{
              className: 'input-formulario-2',
              style: { color: 'white', backgroundColor: 'rgb(20, 111, 165)' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    style={{ color: 'white' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            InputLabelProps={{
              className: 'label-formulario-2',
              style: { color: 'white' }
            }}
          />
          <Button
            className="boton-formulario"
            fullWidth
            variant="contained"
            type="submit"
            sx={{ mt: 2 }}
          >
            Ingresar
          </Button>
        </form>
        {mensaje && (
          <Typography color="error" sx={{ mt: 2 }}>
            {mensaje}
          </Typography>
        )}
      </Box>
    </div>
  );
}

export default Login;
