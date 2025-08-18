import React, { useState, useEffect } from 'react';
//import '../../../Styles/estilos.css';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface RegistroEmpresaProps {
    onClose?: () => void;
    onSuccess?: (data: any) => void;
}

function RegistroEmpresa({ onClose, onSuccess }: RegistroEmpresaProps) {
    const [formulario, setFormulario] = useState({
        contraseña: '',
        confirmarContraseña: '',
        tiposociedadId: '',
        actividadId: '',
        regimenId: '',
        token: '',
        razonSocial: '',
        nombreComercial: '',
        nit: '',
        dv: '',
        telefono: '',
        email: '',
        representanteLegal: '',
        activo: true,
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
    });

    const [actividades, setActividades] = useState<any[]>([]);
    const [tiposSociedad, setTiposSociedad] = useState<any[]>([]);
    const [regimenes, setRegimenes] = useState<any[]>([]);
    const [mensaje, setMensaje] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState({
        actividades: true,
        tiposSociedad: true,
        regimenes: true
    });
    const navigate = useNavigate();

    useEffect(() => {
        // Cargar actividades económicas
        fetch('https://localhost:7137/api/ConsultasRegistro/ListaActivdad')
            .then(response => response.json())
            .then(data => {
                setActividades(data);
                setLoading(prev => ({ ...prev, actividades: false }));
            })
            .catch(error => {
                console.error('Error al cargar actividades:', error);
                setLoading(prev => ({ ...prev, actividades: false }));
            });

        // Cargar tipos de sociedad
        fetch('https://localhost:7137/api/ConsultasRegistro/ListaTipoSociedad')
            .then(response => response.json())
            .then(data => {
                setTiposSociedad(data);
                setLoading(prev => ({ ...prev, tiposSociedad: false }));
            })
            .catch(error => {
                console.error('Error al cargar tipos de sociedad:', error);
                setLoading(prev => ({ ...prev, tiposSociedad: false }));
            });

        // Cargar regímenes tributarios
        fetch('https://localhost:7137/api/ConsultasRegistro/ListaRegimenTributario')
            .then(response => response.json())
            .then(data => {
                setRegimenes(data);
                setLoading(prev => ({ ...prev, regimenes: false }));
            })
            .catch(error => {
                console.error('Error al cargar regímenes:', error);
                setLoading(prev => ({ ...prev, regimenes: false }));
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormulario({
            ...formulario,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validar que las contraseñas coincidan
        if (formulario.contraseña !== formulario.confirmarContraseña) {
            setMensaje('Las contraseñas no coinciden.');
            return;
        }

        try {
            const respuesta = await fetch('https://localhost:7221/api/Login/registroEmpresa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formulario)
            });

            if (respuesta.ok) {
                const data = await respuesta.json();

                alert('Usted se ha registrado como Empresa con éxito ✅');

                if (onSuccess) onSuccess(data);

                if (onClose) onClose();

                setFormulario({
                    contraseña: '',
                    confirmarContraseña: '',
                    tiposociedadId: '',
                    actividadId: '',
                    regimenId: '',
                    token: '',
                    razonSocial: '',
                    nombreComercial: '',
                    nit: '',
                    dv: '',
                    telefono: '',
                    email: '',
                    representanteLegal: '',
                    activo: true,
                    creadoEn: new Date().toISOString(),
                    actualizadoEn: new Date().toISOString(),
                });
                setMensaje('');
            } else if (respuesta.status === 400) {
                // Leer el mensaje de error del backend
                let errorMsg = 'Error de validación en el registro.';
                try {
                    const errorData = await respuesta.json();
                    errorMsg = errorData.message || errorData.error || JSON.stringify(errorData) || errorMsg;
                } catch {
                    // Si no es JSON, deja el mensaje por defecto
                }
                setMensaje(errorMsg);
            } else {
                setMensaje('Error al registrar la actividad ❌');
            }
        } catch (error) {
            setMensaje('Error de conexión con el servidor.');
        }
    };

    return (
        <div style={{ margin: '2% 10%' }}>
            <div style={{ height: '500%' }}>
                <h2 style={{ fontSize: '2.5rem' }}>Registro como Empresa</h2>
                <form style={{ margin: '0% 0%' }} onSubmit={handleSubmit} className="form-flex">

                    {/* Grupo: Email, Contraseña y Token */}
                    <fieldset style={{ border: '1px solid #ccc', borderRadius: '8px', marginBottom: '1.5em', padding: '1em' }}>
                        <legend style={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 1)', fontSize: '2rem' }}>Acceso</legend>
                        <div className="form-group-flex">
                            <label className="label-formulario-1" style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.7rem' }}>Email:</label>
                            <input
                                className="imput-formulario-1"
                                type="email"
                                name="email"
                                value={formulario.email}
                                onChange={handleChange}
                                required
                                style={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 1)', fontSize: '1.4rem' }}
                            />
                        </div>
                        <div className="form-group-flex" style={{ position: 'relative' }}>
                            <label className="label-formulario-1" style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.7rem' }}>Contraseña:</label>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                    className="imput-formulario-1"
                                    type={showPassword ? 'text' : 'password'}
                                    name="contraseña"
                                    value={formulario.contraseña}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'rgb(255, 255, 255)',
                                        fontSize: '1.4rem',
                                        paddingRight: '2.5rem',
                                        width: '100%'
                                    }}
                                />
                                <span
                                    onClick={() => setShowPassword((show) => !show)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        zIndex: 2
                                    }}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </span>
                            </div>
                        </div>
                        <div className="form-group-flex" style={{ position: 'relative' }}>
                            <label className="label-formulario-1" style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.7rem' }}>Confirmar Contraseña:</label>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                    className="imput-formulario-1"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmarContraseña"
                                    value={formulario.confirmarContraseña}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'rgb(255, 255, 255)',
                                        fontSize: '1.4rem',
                                        paddingRight: '2.5rem',
                                        width: '100%'
                                    }}
                                />
                                <span
                                    onClick={() => setShowConfirmPassword((show) => !show)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        zIndex: 2
                                    }}
                                >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </span>
                            </div>
                        </div>
                        <div className="form-group-flex">
                            <label className="label-formulario-1" style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.7rem' }}>Token:</label>
                            <input
                                className="imput-formulario-1"
                                type="text"
                                name="token"
                                value={formulario.token}
                                onChange={handleChange}
                                style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.4rem' }}
                            />
                        </div>
                    </fieldset>

                    {/* Grupo: Datos de contacto */}
                    <fieldset style={{ border: '1px solid #ccc', borderRadius: '8px', marginBottom: '1.5em', padding: '1em' }}>
                        <legend style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '2rem' }}>Datos de Contacto</legend>
                        <div className="form-group-flex">
                            <label style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.7rem' }} className="label-formulario-1">Teléfono:</label>
                            <input
                                className="imput-formulario-1"
                                type="text"
                                name="telefono"
                                value={formulario.telefono}
                                onChange={handleChange}
                                style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.4rem' }}
                            />
                        </div>
                        <div className="form-group-flex">
                            <label className="label-formulario-1" style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.7rem' }}>Representante Legal:</label>
                            <input
                                className="imput-formulario-1"
                                type="text"
                                name="representanteLegal"
                                value={formulario.representanteLegal}
                                onChange={handleChange}
                                style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.4rem' }}
                            />
                        </div>
                    </fieldset>

                    {/* Grupo: Otros datos */}
                    <fieldset style={{ border: '1px solid #ccc', borderRadius: '8px', marginBottom: '1.5em', padding: '1em' }}>
                        <legend style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '2rem' }}>Datos de la Empresa</legend>
                        
                        {/* Select Tipo Sociedad */}
                        <div className="form-group-flex">
                            <label className="label-formulario-1" style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.7rem' }}>Tipo Sociedad:</label>
                            {loading.tiposSociedad ? (
                                <p style={{ color: 'white' }}>Cargando tipos de sociedad...</p>
                            ) : (
                                <select
                                    className="imput-formulario-1"
                                    name="tiposociedadId"
                                    value={formulario.tiposociedadId}
                                    onChange={handleChange}
                                    required
                                    style={{ backgroundColor: 'rgb(45, 84, 113)',  fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.4rem' }}
                                >
                                    <option value="">Seleccione un tipo de sociedad</option>
                                    {tiposSociedad.map((tipo) => (
                                        <option key={tipo.id} value={tipo.id}>
                                            {tipo.nombre}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        
                        {/* Select Actividad Económica */}
                        <div className="form-group-flex">
                            <label className="label-formulario-1" style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.7rem' }}>Actividad Económica:</label>
                            {loading.actividades ? (
                                <p style={{ color: 'white' }}>Cargando actividades...</p>
                            ) : (
                                <select
                                    className="imput-formulario-1"
                                    name="actividadId"
                                    value={formulario.actividadId}
                                    onChange={handleChange}
                                    required
                                    style={{ backgroundColor: 'rgb(45, 84, 113)',  fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.4rem' }}
                                >
                                    <option value="">Seleccione una actividad económica</option>
                                    {actividades.map((actividad) => (
                                        <option  key={actividad.id} value={actividad.id}>
                                            {actividad.nombre}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        
                        {/* Select Régimen Tributario */}
                        <div className="form-group-flex">
                            <label className="label-formulario-1" style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.7rem' }}>Régimen Tributario:</label>
                            {loading.regimenes ? (
                                <p style={{ color: 'white' }}>Cargando regímenes...</p>
                            ) : (
                                <select
                                    className="imput-formulario-1"
                                    name="regimenId"
                                    value={formulario.regimenId}
                                    onChange={handleChange}
                                    required
                                    style={{ backgroundColor: 'rgb(45, 84, 113)', fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.4rem' }}
                                >
                                    <option value="">Seleccione un régimen tributario</option>
                                    {regimenes.map((regimen) => (
                                        <option key={regimen.id} value={regimen.id}>
                                            {regimen.nombre}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        
                        <div className="form-group-flex">
                            <label className="label-formulario-1" style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.7rem' }}>Razón Social:</label>
                            <input
                                className="imput-formulario-1"
                                type="text"
                                name="razonSocial"
                                value={formulario.razonSocial}
                                onChange={handleChange}
                                required
                                style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.4rem' }}
                            />
                        </div>
                        <div className="form-group-flex">
                            <label className="label-formulario-1" style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.7rem' }}>Nombre Comercial:</label>
                            <input
                                className="imput-formulario-1"
                                type="text"
                                name="nombreComercial"
                                value={formulario.nombreComercial}
                                onChange={handleChange}
                                style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.4rem' }}
                            />
                        </div>
                        <div className="form-group-flex">
                            <label className="label-formulario-1" style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.7rem' }}>NIT:</label>
                            <input
                                className="imput-formulario-1"
                                type="text"
                                name="nit"
                                value={formulario.nit}
                                onChange={handleChange}
                                required
                                style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.4rem' }}
                            />
                        </div>
                        <div className="form-group-flex">
                            <label className="label-formulario-1" style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.7rem' }}>DV:</label>
                            <input
                                className="imput-formulario-1"
                                type="text"
                                name="dv"
                                value={formulario.dv}
                                onChange={handleChange}
                                style={{ fontWeight: 'bold', color: 'rgb(255, 255, 255)', fontSize: '1.4rem' }}
                            />
                        </div>
                    </fieldset>

                    <div className="bloque-botones">
                        <button
                            className="boton-formulario"
                            style={{ fontSize: '1.4rem', padding: '0.7em 2.5em', margin: '0 0.5em', fontWeight: 'bold' }}
                            type="submit"
                        >
                            Registrar
                        </button>
                        
                    </div>
                </form>
                {mensaje && <p style={{ color: 'red', textAlign: 'center' }}>{mensaje}</p>}
            </div>
        </div>
    );
}

export default RegistroEmpresa;