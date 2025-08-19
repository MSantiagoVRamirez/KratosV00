import React, { useState } from 'react';
import '../../../Styles/estilos.css';
import img1 from '../../../../../public/media/misc/portfolio.png';
import { ActividadEconomica } from '../../../interfaces/Configuracion/ActividadEconomica';
import { RegimenTributario } from '../../../interfaces/Configuracion/RegimenTributario';
import { TipoSociedad } from '../../../interfaces/Configuracion/TipoSociedad';
import {RegistroEmpresaStepper } from './RegistroEmpresaStepper';
import { Empresa } from '../../../interfaces/seguridad/Empresa';
import loginService from '../../../services/seguridad/loginService'
import consultasRegistroService from '../../../services/seguridad/consultasRegistroService';
import { ModalDialog } from "../../../pages/components/ModalDialog"
import { useFormValidation } from '../../../hooks/useFormValidation'
import { grid2ColStyle } from "../../../utils"
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';


function Landing() {
    const [actividad, setActividad] = useState<ActividadEconomica[]>([])
    const [rigimenes, setRigimenes] = useState<RegimenTributario[]>([])
    const [tiposSociedad, setTiposSociedad] = useState<TipoSociedad[]>([])
    const [modalType, setModalType] = useState<'registroEmpresa' | 'registroUsuario' | 'loginEmpresa' | 'loginUsuario' | null>(null);
    const defaultEmpresa: Empresa = {
        id: 0,
        contraseña: '',
        confirmarContraseña: '',
        tiposociedadId: 0,
        actividadId: 0,
        regimenId: 0,
        token: '',
        razonSocial: '',
        nombreComercial: '',
        nit: '',
        dv: '',
        telefono: '',
        email: '',
        representanteLegal: '',
        activo: true,
        creadoEn:  new Date().toISOString(),
        actualizadoEn:  new Date().toISOString(),
      } 
    const [login, setLogin] = useState({ email: '', contraseña: '' })
    const closeModal = () => setModalType(null)
    const navigate = useNavigate();
    
    const isFormValid = useFormValidation({
        email: { value: login.email, required: true, type: 'string' },
        contraseña: { value: login.contraseña, required: true, type: 'string' }
    });
    const { invertAuth, saveUser, saveRole } = useAuth();

    // Registrar Empresa
    const RegistrarEmpresa = (data: Empresa) => {
        loginService.registroEmpresa(data)
        .then(() => {
            alert("Empresa registrada exitosamente");
           
        })
        .catch((error) => {
            console.error("Hubo un error al registrar la empresa", error)
         alert(`Error al Registrar la Empresa: ${error.response?.data || error.response?.data?.message || error.message}`);
          })
    }
    //llamar servicio para loguear se como empresa
const handleLoginEmpresa = async () => {
  try {
    const { data } = await loginService.loginEmpresa(login.email, login.contraseña);
    console.log('login ok', data);

    // 1) Actualiza el contexto de auth como hacías antes
    const emailResp =
      data?.empresa?.email ?? data?.usuario?.email ?? login.email;
    const roleResp =
      data?.empresa ? 'Empresa' : (data?.usuario?.rol ?? 'Usuario');

    saveUser(emailResp);
    saveRole(roleResp);
    // si invertAuth() solo “alterna”, asegúrate que parte de "false" -> "true"
    invertAuth();

    // 2) Cierra el modal (si aplica) y navega
    closeModal?.();
    navigate('/dashboard', { replace: true });
  } catch (error: any) {
    console.error('Hubo un error al iniciar sesión como Empresa', error);
    alert(
      `Error al iniciar sesión como Empresa: ${
        error.response?.data || error.response?.data?.message || error.message
      }`
    );
  }
};
    //llamar el servicio para loguearse como usuario
    const handleLoginUsuario = () =>{
        loginService.loginUsuario(login.email, login.contraseña)
        .then(() => {
            navigate('/dashboard', { replace: true });
        })
        .catch((error) => {
            console.error("Hubo un error al iniciar sesión como Usuario", error);
            alert(`Error al iniciar sesión como Usuario: ${error.response?.data || error.response?.data?.message || error.message}`);
        });
    }

    // traer actividades economicas
    const getActividadesEconomicas = () => {
        consultasRegistroService.getActividadesEconomicas()
            .then(response => {
                setActividad(response.data);
            })
            .catch(error => {
                console.error("Error al obtener actividades económicas", error);
            });
    }
    // traer regimenes tributarios
    const getRegimenesTributarios = () => {
        consultasRegistroService.getRegimenesTributarios()
            .then(response => {
                setRigimenes(response.data);
            })
            .catch(error => {
                console.error("Error al obtener regimenes tributarios", error);
            });
    }
    // traer tipos de sociedad
    const getTiposSociedad = () => {
        consultasRegistroService.getTiposSociedad()
            .then(response => {
                setTiposSociedad(response.data);
            })
            .catch(error => {
                console.error("Error al obtener tipos de sociedad", error);
            });
    }
    // Cargar datos al iniciar el componente
    React.useEffect(() => {
        getActividadesEconomicas();
        getRegimenesTributarios();
        getTiposSociedad();
    }, []);

    return (
        <div className="content-2">
            <div className="header-21">
                <h1 style={{ color: 'rgb(255, 255, 255)', scale: '2', padding: '0px 50px' }}>KRATOS</h1>
                <div className="header-botones">
                    <button
                        style={{ marginTop: '0px' }}
                        className="boton-formulario"
                        onClick={() => setModalType('loginEmpresa')}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        style={{ marginTop: '0px' }}
                        className="boton-formulario"
                        onClick={() => setModalType('registroEmpresa')}
                    >
                        Registro
                    </button>
                </div>
            </div>

            <br /><br /><br /><br />

            <div className="bloque-2">
                <div>
                    <h2 className="h2-index">Transforma tu Negocio</h2>
                    <p className="p-index">La solución todo en uno para gestión de inventario, ventas y clientes</p>
                    <div className="bloque-botnones">
                        <a href="/registro" className="boton-formulario">Prueba Gratis</a>
                        <a href="#demo" className="boton-formulario">Ver Demo</a>
                    </div>
                </div>
            </div>

            <br /><br />

            <div id="features" className="formulario-1">
                <h2>Características Principales</h2>
                <div className="row">
                    <div className="col">
                        <div className="bloque-formulario">
                            <h3>🛒 Gestión de Inventario</h3>
                            <p>Control total de tu stock con alertas inteligentes</p>
                        </div>
                    </div>
                    <div className="col">
                        <div className="bloque-formulario">
                            <h3>📊 Reportes en Tiempo Real</h3>
                            <p>Métricas clave para tomar mejores decisiones</p>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <div className="bloque-formulario">
                            <h3>👥 CRM Integrado</h3>
                            <p>Gestiona tus clientes y fidelízalos</p>
                        </div>
                    </div>
                    <div className="col">
                        <div className="bloque-formulario">
                            <h3>💳 Punto de Venta</h3>
                            <p>Sistema rápido y seguro para tus transacciones</p>
                        </div>
                    </div>
                </div>
            </div>

            <br /><br />

            <div id="demo" className="formulario-1">
                <h2>Vista Previa</h2>
                <div className="bloque-formulario text-center ">
                    <img src={img1} alt="Demo" style={{ maxWidth: "100%", borderRadius: "10px", border: "2px solid white" }} />
                    <div className="bloque-botnones mt-3">
                        <a href="#" className="boton-formulario">Tour Interactivo</a>
                    </div>
                </div>
            </div>

            <br /><br />

            <div className="formulario-1">
                <h2>Lo que dicen nuestros usuarios</h2>
                <div className="row">
                    <div className="col">
                        <div className="bloque-formulario">
                            <p>"ShopConnect revolucionó mi negocio. Ahora tengo todo bajo control en un solo lugar."</p>
                            <p><strong>- María Gómez, Tienda de Ropa</strong></p>
                        </div>
                    </div>
                    <div className="col">
                        <div className="bloque-formulario">
                            <p>"La implementación fue sencilla y el soporte excelente. ¡Altamente recomendado!"</p>
                            <p><strong>- Carlos Ruiz, Ferretería</strong></p>
                        </div>
                    </div>
                </div>
            </div>

            <br /><br />

            <div className="formulario-1">
                <div>
                    <h2 className="h2-index-1">¿Listo para comenzar?</h2>
                    <p className="p-index">Regístrate hoy y obtén 14 días gratis</p>
                </div>
                <div className="bloque-botnones mt-3">
                    <a href="/registro" className="boton-formulario">¡Empezar Ahora!</a>
                </div>
            </div>
        {/* Modal Stepper de Creación/Registro de Empresa */}
        <RegistroEmpresaStepper
          show={modalType === 'registroEmpresa' || modalType === 'registroUsuario'}
          handleClose={closeModal}
          onSubmit={(Empresa) => {
            if (modalType === 'registroEmpresa') {
              RegistrarEmpresa(Empresa);
            }
          }}
          modalType={modalType === 'registroEmpresa' ? 'create' : 'edit'}
          actividades={actividad}        
          rigimenes={rigimenes}             
          tiposSociedad={tiposSociedad} 
        />
        {/* Formulario de Login */}
            {(modalType === 'loginEmpresa' || modalType == 'loginUsuario') && (
              <ModalDialog
            title={modalType === 'loginEmpresa' ? "Iniciar Session como Empresa" : "Iniciar Sesion Como Usuario"}
            isFormValid={isFormValid}
            content={
              <div style={grid2ColStyle}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{color:'white'}} className="form-label required">Email</label>
                  <input
                    type="text"
                    placeholder="Email"
                    onChange={(e) =>
                      setLogin(prev => ({
                        ...prev,
                        email: e.target.value  
                      }))
                    }
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{color:'white'}} className="form-label required">Contraseña</label>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    onChange={(e) =>
                      setLogin(prev => ({
                        ...prev,
                        contraseña: e.target.value    
                      }))
                    }
                    className="form-control"
                    required
                  />
                </div>
              </div>
            }
            textBtn="Iniciar Sesión"
            onConfirm={() => { // Llamar a la función correcta con el estado unificado
              if (modalType === 'loginEmpresa') {
                handleLoginEmpresa();
              } else if (modalType === 'loginUsuario') {
                handleLoginUsuario();
              }
            }}
            closeModal={closeModal}
          />
            )}
          </div>
    );
}

export default Landing;
