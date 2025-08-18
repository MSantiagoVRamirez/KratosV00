import React, { useState } from 'react';
import '../../../Styles/estilos.css';
import img1 from '../../../../../public/media/misc/portfolio.png';
import RegistroEmpresa from './RegistroEmpresa';
import RegistroUsuario from './RegistroUsuario';
import Login from './Login';
import LoginUsuario from './LoginUsuario';
import { ModalDialog } from "../../../pages/components/ModalDialog"

function Landing() {
    const [mostrarModalMidleRegistro, setMostrarMidleRegistro] = useState(false);
    const [tipoRegistro, setTipoRegistro] = useState('usuario'); // 'empresa' o 'usuario'
    const [mostrarModalMidleLogin, setMostrarMidleLogin] = useState(false);
    const [tipoLogin, setTipoLogin] = useState('usuario'); // 'empresa' o 'usuario'

    const [modalType, setModalType] = useState<'registroEmpresa' | 'registroUsuario' | 'loginEmpresa' | 'loginUsuario' | null>(null);

    const handleRegistroExitoso = () => {
        setMostrarMidleRegistro(false);
    };

    const handleLoginExitoso = () => {
        setMostrarMidleLogin(false);
    };

    return (
        <div className="content-2">
            <div className="header-21">
                <h1 style={{ color: 'rgb(255, 255, 255)', scale: '2', padding: '0px 50px' }}>KRATOS</h1>
                <div className="header-botones">
                    <button
                        style={{ marginTop: '0px' }}
                        className="boton-formulario"
                        onClick={() => {
                            setTipoLogin('usuario');
                            setMostrarMidleLogin(true);
                        }}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        style={{ marginTop: '0px' }}
                        className="boton-formulario"
                        onClick={() => {
                            setTipoRegistro('usuario');
                            setMostrarMidleRegistro(true);
                        }}
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

            {/* Modal para Registro Empresa/Usuario */}
            {(modalType === 'registroEmpresa' || modalType === 'registroUsuario') && (
                

            )}
        </div>

    );
}

export default Landing;
