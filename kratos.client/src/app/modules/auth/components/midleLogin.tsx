import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography } from '@mui/material';
//import '../../styles/estilos.css';

function MidleLogin() {
    const navigate = useNavigate();

    return (
        <div className="bloque-formulario" style={{ minHeight: '10vh', padding: '2em', maxWidth: '90%', margin: 'auto' }}>
            <div className="row" style={{ minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
                <div className="col" style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                        className="boton-registro-midle"
                        style={{ width: '100%', height: '200px', fontSize: '2rem' }}
                        onClick={() => navigate('/login')}
                    >
                        Inicio de sesión como Usuario
                    </button>
                </div>
                <div className="col" style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                        className="boton-registro-midle"
                        style={{ width: '100%', height: '200px', fontSize: '2rem' }}
                        onClick={() => navigate('/login')}
                    >
                        Inicio de sesión como Empresa
                    </button>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                    <Button
                        className='boton-formulario'
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2, color: 'white', borderColor: 'white' }}
                        onClick={() => navigate('/')}
                    >
                        Volver
                    </Button>
            </div>
        </div>
    );
}
export default MidleLogin;