import { KTIcon } from "../../../_metronic/helpers";
import { ActasContratoWidget } from "./ActasContratoWidget";
import { AmpliacionesContratoWidget } from "./AmpliacionesContratoWidget";
import { OrdenesServicioWidget } from "./OrdenesServicioWidget";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Contrato } from "../../interfaces/contratos-ods/Contrato";
import { Empresa } from "../../interfaces/seguridad/Empresa";
import { Usuario } from "../../interfaces/seguridad/Usuario";
import { IndicadorSECS } from "../../interfaces/secs/IndicadorSECS";
import contratoService from "../../services/contratos-ods/contratoService";
import empresaService from "../../services/seguridad/empresaService";
import usuarioService from "../../services/seguridad/usuarioService";
import indicadorSECSService from "../../services/secs/indicadorSECSService";
import { ModalDialog } from "../components/ModalDialog";
import { useAuth } from "../../modules/auth/AuthContext";
import { SuspensionesContratoWidget } from "./SuspensionesContratoWidget";
import AreaChart from "../components/AreaChart";

export function ContratoDetails({ propsContratoId }: { propsContratoId: number }) {

  const location = useLocation();
  const selectedContratoId = location.state?.propsContratoId || propsContratoId;

  const { role } = useAuth();
  const currentRole = role || '';
  const esOriginador = currentRole === 'Administrador' || currentRole === 'S&C Cenit';
  const esAprobador = currentRole === 'Administrador' || currentRole === 'Jefe Ingeniería';

  const defaultContrato: Contrato = {
    id: 0,
    numero: '',
    numeroSeguimientoCenit: null,
    numeroSeguimientoContratista: null,
    objeto: '',
    empresaId: 0,
    originadorId: 0,
    adminContratoId: 0,
    jefeIngenieriaId: 0,
    fechaInicio: '',
    fechaFin: '',
    fechaFinalOriginal: '',
    portafolio: 0,
    valorCostoDirecto: 0,
    valorInicialCostoDirecto: 0,
    valorGastosReembolsables: 0,
    valorInicialGastosReembolsables: 0,
    valorComprometido: 0,
    valorPagado: 0,
    valorFaltaPorPagar: 0,
    numeroOdsSuscritas: 0,
    valorDisponible: 0,
    valorDisponibleGastosReembolsables: 0,
    estado: 0,
    estaAprobado: false,
    estaRechazado: false,
    estaSuspendido: false,
    comentarioAprobacion: null
  }
  const [editedContrato, setEditedContrato] = useState<Contrato>(defaultContrato)
  const [deleteContratoId, setDeleteContratoId] = useState<number>(defaultContrato.id)

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [indicadoresSECS, setIndicadoresSECS] = useState<IndicadorSECS[]>([])

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'delete' | 'edit' | 'approve' | 'disapprove' | 'reject' | 'unreject' | null>(null)

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

  const [isEditing, setIsEditing] = useState(false)

  // Obtener todas las empresas
  const fetchEmpresas = () => {
    empresaService
      .getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setEmpresas(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las empresas", error)
      })
  }

  // Obtener todos los usuarios
  const fetchUsuarios = () => {
    usuarioService
      .getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setUsuarios(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los usuarios", error)
      })
  }

  // Obtener un solo contrato (para editar)
  const fetchContrato = (id: number) => {
    contratoService
      .get(id)
      .then((response) => {
        if (response.data.length !== 0) {
          setEditedContrato(response.data)  // Llenar el formulario de edición
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el contrato", error)
      })
  }

  // Obtener todos los contratos cada vez que se renderiza el componente
  useEffect(() => {
    fetchEmpresas()  // Obtener todas las empresas
    fetchUsuarios()  // Obtener todos los usuarios
    fetchContrato(selectedContratoId)  // Obtener los datos del contrato
    fetchSECSByContratoId(selectedContratoId)  // Obtener los indicadores SECS del contrato
  }, [])

  // Efecto para mostrar información adicional cuando los SECS se cargan
  useEffect(() => {
    if (Array.isArray(indicadoresSECS) && indicadoresSECS.length > 0) {
      console.log("Datos SECS cargados para los gráficos:", indicadoresSECS);
      console.log("Total de registros SECS:", indicadoresSECS.length);
      const latestSECS = getLatestSECSData();
      if (latestSECS) {
        console.log("SECS más reciente:", latestSECS);
        console.log("Calificación total ponderada:", latestSECS.totalPonderado);
      }
    } else if (indicadoresSECS && !Array.isArray(indicadoresSECS)) {
      console.warn("Los datos SECS no son un array:", indicadoresSECS);
    }
  }, [indicadoresSECS]);

  // Actualizar un contrato
  const updateContrato = (data: Contrato) => {
    // Calcular valorDisponible
    const valorTotal = data.valorCostoDirecto + data.valorGastosReembolsables;
    const valorDisponible = valorTotal - (data.valorComprometido || 0);
    
    const contratoToUpdate = {
      ...data,
      valorDisponible
    };
    
    contratoService
      .update(contratoToUpdate)
      .then(() => {
        fetchContrato(selectedContratoId) // Obtener el contrato actualizado
        setIsEditing(false) // Desactivar el modo de edición
        closeModal() // Cerrar el modal de edición
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el contrato", error)
        alert(`Error al actualizar contrato: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar un contrato
  const deleteContrato = () => {
    contratoService
      .remove(deleteContratoId)
      .then(() => {
        setDeleteContratoId(defaultContrato.id) // Limpiar el input de eliminación
        alert("Contrato eliminado exitosamente")
        navigate(-1) // Volver a la página anterior
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el contrato", error)
        alert(`Error al eliminar contrato: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteContratoId(id)
    setModalType('delete')
  }

  const navigate = useNavigate();

  // Formatear el número a moneda
  const formatCurrency = (number: string) => {
    const parsed = parseFloat(number);
    if (isNaN(parsed)) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(parsed);
  };

  // Manejar el cambio de valor en los inputs de moneda
  const handleChangeCostoDirecto = (rawInput: string) => {
    const numericValue = parseInt(rawInput.replace(/[^0-9]/g, ''), 10);
    setEditedContrato((prev) => ({
      ...prev,
      valorCostoDirecto: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  const handleChangeGastosRembolsables = (rawInput: string) => {
    const numericValue = parseInt(rawInput.replace(/[^0-9]/g, ''), 10);
    setEditedContrato((prev) => ({
      ...prev,
      valorGastosReembolsables: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  const filtered_empresas = empresas.filter(empresa => empresa.nombre !== 'Cenit').sort((a, b) => a.nombre.localeCompare(b.nombre))
  const filtered_usuarios = usuarios.filter(usuario => usuario.empresaId == editedContrato.empresaId ).sort((a, b) => `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`));
  const jefes_ingenieria = usuarios.filter(usuario => usuario.rolId === 7).sort((a, b) => `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`));

  // Funciones helper para obtener nombres
  const getEmpresaName = (id: number) => {
    const empresa = empresas.find(e => e.id === id);
    return empresa ? empresa.nombre : 'No asignada';
  };

  const getUsuarioName = (id: number) => {
    const usuario = usuarios.find(u => u.id === id);
    return usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'No asignado';
  };

  const getEstadoText = (estado: number) => {
    switch (estado) {
      case 0: return 'Pendiente';
      case 1: return 'En Proceso';
      case 2: return 'Rechazado';
      case 3: return 'Completado';
      case 4: return 'Suspendido';
      default: return 'Desconocido';
    }
  };

  const getEstadoBadgeClass = (estado: number) => {
    switch (estado) {
      case 0: return 'badge-warning';
      case 1: return 'badge-primary';
      case 2: return 'badge-danger';
      case 3: return 'badge-success';
      case 4: return 'badge-secondary';
      default: return 'badge-light';
    }
  };

  const getPortafolioText = (portafolio: number) => {
    switch (portafolio) {
      case 0: return 'Baja complejidad';
      case 1: return 'Media complejidad';
      case 2: return 'Alta complejidad';
      default: return 'No definido';
    }
  };

  const calcularPlazo = () => {
    if (editedContrato.fechaFinalOriginal && editedContrato.fechaInicio) {
      const inicio = new Date(editedContrato.fechaInicio);
      const fin = new Date(editedContrato.fechaFinalOriginal);
      const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 3600 * 24));
      return `${dias} días`;
    }
    return '0 días';
  };

  // Obtener los SECS asociados al contrato seleccionado
  const fetchSECSByContratoId = (contratoId: number) => {
    console.log("Solicitando indicadores SECS para Contrato ID:", contratoId);
    indicadorSECSService.getCalPromByContratoId(contratoId)
      .then((response) => {
        console.log("Respuesta del servicio SECS:", response);
        console.log("Tipo de response.data:", typeof response.data);
        console.log("Es array response.data:", Array.isArray(response.data));
        
        let secsData: IndicadorSECS[] = [];
        
        if (response.data) {
          // Si la respuesta es un array
          if (Array.isArray(response.data)) {
            secsData = response.data;
          } 
          // Si la respuesta es un objeto que contiene un array
          else if (typeof response.data === 'object') {
            // Buscar si hay una propiedad que contenga el array de datos
            if (response.data.data && Array.isArray(response.data.data)) {
              secsData = response.data.data;
            } else if (response.data.indicadores && Array.isArray(response.data.indicadores)) {
              secsData = response.data.indicadores;
            } else if (response.data.items && Array.isArray(response.data.items)) {
              secsData = response.data.items;
            } else {
              // Si es un objeto con las propiedades del IndicadorSECS, convertirlo a array
              if (response.data.id !== undefined) {
                secsData = [response.data];
              } else {
                console.warn("Estructura de datos no reconocida:", response.data);
                secsData = [];
              }
            }
          }
        }
        
        console.log("Datos SECS procesados:", secsData);
        console.log("Número de registros SECS:", secsData.length);
        
        setIndicadoresSECS(secsData);
        
        if (secsData.length > 0) {
          console.log("Indicadores SECS cargados exitosamente:", secsData);
        } else {
          console.log("No se encontraron indicadores SECS para el contrato seleccionado.");
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los indicadores SECS", error);
        console.error("Detalles del error:", error.response?.data || error.message);
        setIndicadoresSECS([]);
      });
  }

  // Funciones para procesar datos de SECS y usarlos en los gráficos
  const getLatestSECSData = () => {
    if (!Array.isArray(indicadoresSECS) || indicadoresSECS.length === 0) return null;
    // Obtener el registro más reciente
    const sortedData = [...indicadoresSECS].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    return sortedData[0];
  }

  const getPromedioSECSData = () => {
    if (!Array.isArray(indicadoresSECS) || indicadoresSECS.length === 0) return { data: [], categories: [] };
    
    const sortedSECS = [...indicadoresSECS].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    return {
      data: sortedSECS.map(item => item.totalPonderado || 0),
      categories: sortedSECS.map(item => new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }))
    };
  }

  return (
    <>
      <div className="d-flex flex-column p-5 gap-5">
        {/* Header con botones de acción */}
        <div className="d-flex justify-content-between align-items-center">
          <button onClick={() => navigate(-1)} className="btn btn-sm btn-light-primary" style={{ width: "fit-content" }}>
            <KTIcon iconName="arrow-left" className="fs-1" />{" "}
            Volver
          </button>
          <div className="d-flex gap-3">
            {isEditing && (
              <button onClick={() => setModalType('edit')} className="btn btn-sm btn-light-success" style={{ width: "fit-content" }}>
                <KTIcon iconName="check" className="fs-1" />{" "}
                Guardar Cambios
              </button>
            )}
            {isEditing ? (
              <button onClick={() => {
                setIsEditing(false);
                fetchContrato(selectedContratoId); // Resetear el contrato editado al original
              }} className="btn btn-sm btn-light-info" style={{ width: "fit-content" }}>
                <KTIcon iconName="x" className="fs-2" />{" "}
                Cancelar
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-sm btn-light-info"
                style={{ width: "fit-content" }}
                disabled={editedContrato.estado == 1 || editedContrato.estado == 3}
              >
                <KTIcon iconName="pencil" className="fs-2" />{" "}
                Editar
              </button>
            )}
            <button
              onClick={() => openDeleteModal(selectedContratoId)}
              className="btn btn-sm btn-light-danger"
              style={{ width: "fit-content" }}
              disabled={editedContrato.estado == 1 || editedContrato.estado == 3}
            >
              <KTIcon iconName="trash" className="fs-2" />{" "}
              Eliminar
            </button>
          </div>
        </div>

        {/* Título y estado */}
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="fw-bolder my-5 ms-5">Detalles del contrato</h1>
          <div className="d-flex gap-3 align-items-center">
            <span className={`badge fs-6 ${getEstadoBadgeClass(editedContrato.estado)}`}>
              {getEstadoText(editedContrato.estado)}
            </span>
          </div>
        </div>

        {/* Sección 5: Estado y Aprobación */}
        <div className="card mb-8">
          <div className="card-header border-0 py-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon iconName="check-square" className="fs-1 position-absolute ms-6" />
                <h3 className="fw-bold ms-15">Estado y Aprobación</h3>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="row g-6">
              {/* Controles de aprobación - Visibles para aprobadores */}
              {esAprobador && (
                <>
                  <div className="col-lg-4">
                    <div className="form-check form-switch form-check-custom form-check-success form-check-solid h-100 d-flex align-items-center">
                      <div>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="contratoDetailAprobadoSwitch"
                          checked={editedContrato.estaAprobado}
                          onChange={(e) => isEditing && e.target.checked ? setModalType('approve') : setModalType('disapprove')}
                          disabled={!isEditing}
                        />
                        <label className="form-check-label fw-semibold fs-6 ms-3" htmlFor="contratoDetailAprobadoSwitch">
                          Aprobado
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="form-check form-switch form-check-custom form-check-danger form-check-solid h-100 d-flex align-items-center">
                      <div>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="contratoDetailRechazadoSwitch"
                          checked={editedContrato.estaRechazado}
                          onChange={(e) => isEditing && e.target.checked ? setModalType('reject') : setModalType('unreject')}
                          disabled={!isEditing}
                        />
                        <label className="form-check-label fw-semibold fs-6 ms-3" htmlFor="contratoDetailRechazadoSwitch">
                          Rechazado
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="form-check form-switch form-check-custom form-check-warning form-check-solid h-100 d-flex align-items-center">
                      <div>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="contratoDetailSuspendidoSwitch"
                          checked={editedContrato.estaSuspendido}
                          onChange={(e) => setEditedContrato({ ...editedContrato, estaSuspendido: e.target.checked })}
                          disabled={!isEditing}
                        />
                        <label className="form-check-label fw-semibold fs-6 ms-3" htmlFor="contratoDetailSuspendidoSwitch">
                          Suspendido
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Comentario de aprobación */}
              <div className="col-12">
                <label className="form-label fw-semibold fs-6">Comentario de Aprobación</label>
                {isEditing && esAprobador ? (
                  <textarea
                    value={editedContrato.comentarioAprobacion || ''}
                    onChange={(e) => setEditedContrato({ ...editedContrato, comentarioAprobacion: e.target.value })}
                    className="form-control"
                    rows={3}
                    placeholder="Comentario sobre la aprobación, rechazo o estado del contrato"
                  />
                ) : (
                  <div className="bg-light rounded p-4">
                    <span>{editedContrato.comentarioAprobacion || 'Sin comentarios'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección 1: Información Básica */}
        <div className="card mb-8">
          <div className="card-header border-0 py-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon iconName="document" className="fs-1 position-absolute ms-6" />
                <h3 className="fw-bold ms-15">Información Básica</h3>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="row g-6">
              {/* Número del contrato - Solo lectura siempre */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Número del Contrato</label>
                <div className="bg-light rounded p-3">
                  <span className="fw-bold fs-4 text-primary">{editedContrato.numero || 'Sin asignar'}</span>
                </div>
              </div>

              {/* Portafolio - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Portafolio</label>
                {isEditing && esOriginador ? (
                  <select
                    value={editedContrato.portafolio}
                    onChange={(e) => setEditedContrato({ ...editedContrato, portafolio: parseInt(e.target.value) })}
                    className="form-select"
                  >
                    <option value={2}>Alta complejidad</option>
                    <option value={0}>Baja complejidad</option>
                    <option value={1}>Media complejidad</option>
                  </select>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-semibold">{getPortafolioText(editedContrato.portafolio)}</span>
                  </div>
                )}
              </div>

              {/* Números de seguimiento - Editables por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Número Seguimiento Cenit</label>
                {isEditing && esOriginador ? (
                  <input
                    type="text"
                    value={editedContrato.numeroSeguimientoCenit || ''}
                    onChange={(e) => setEditedContrato({ ...editedContrato, numeroSeguimientoCenit: e.target.value })}
                    className="form-control"
                    placeholder="Ingrese número de seguimiento Cenit"
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span>{editedContrato.numeroSeguimientoCenit || 'No asignado'}</span>
                  </div>
                )}
              </div>

              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Número Seguimiento Contratista</label>
                {isEditing && esOriginador ? (
                  <input
                    type="text"
                    value={editedContrato.numeroSeguimientoContratista || ''}
                    onChange={(e) => setEditedContrato({ ...editedContrato, numeroSeguimientoContratista: e.target.value })}
                    className="form-control"
                    placeholder="Ingrese número de seguimiento contratista"
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span>{editedContrato.numeroSeguimientoContratista || 'No asignado'}</span>
                  </div>
                )}
              </div>

              {/* Objeto - Editable por originador */}
              <div className="col-12">
                <label className="form-label fw-semibold fs-6 required">Objeto del Contrato</label>
                {isEditing && esOriginador ? (
                  <textarea
                    value={editedContrato.objeto}
                    onChange={(e) => setEditedContrato({ ...editedContrato, objeto: e.target.value })}
                    className="form-control"
                    rows={3}
                    placeholder="Describa el objeto del contrato"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-4">
                    <span>{editedContrato.objeto || 'No definido'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2: Asignaciones */}
        <div className="card mb-8">
          <div className="card-header border-0 py-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon iconName="people" className="fs-1 position-absolute ms-6" />
                <h3 className="fw-bold ms-15">Asignaciones</h3>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="row g-6">
              {/* Consultor - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6 required">Consultor</label>
                {isEditing && esOriginador ? (
                  <select
                    value={editedContrato.empresaId}
                    onChange={(e) => setEditedContrato({ ...editedContrato, empresaId: parseInt(e.target.value) })}
                    className="form-select"
                    required
                  >
                    <option value="">Seleccione una empresa</option>
                    {filtered_empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-semibold">{getEmpresaName(editedContrato.empresaId)}</span>
                  </div>
                )}
              </div>

              {/* Originador - Solo lectura siempre */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Originador</label>
                <div className="bg-light rounded p-3">
                  <span className="fw-semibold">{getUsuarioName(editedContrato.originadorId)}</span>
                </div>
              </div>

              {/* Representante del Contrato - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6 required">Representante del Contrato</label>
                {isEditing && esOriginador ? (
                  <select
                    value={editedContrato.adminContratoId}
                    onChange={(e) => setEditedContrato({ ...editedContrato, adminContratoId: parseInt(e.target.value) })}
                    className="form-select"
                    required
                  >
                    <option value={0}>Seleccione un representante</option>
                    {filtered_usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombres} {usuario.apellidos}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-semibold">{getUsuarioName(editedContrato.adminContratoId)}</span>
                  </div>
                )}
              </div>

              {/* Jefe Ingeniería - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Jefe Ingeniería</label>
                {isEditing && esOriginador ? (
                  <select
                    value={editedContrato.jefeIngenieriaId}
                    onChange={(e) => setEditedContrato({ ...editedContrato, jefeIngenieriaId: parseInt(e.target.value) })}
                    className="form-select"
                  >
                    <option value={0}>Seleccione un jefe de ingeniería</option>
                    {jefes_ingenieria.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombres} {usuario.apellidos}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-semibold">{getUsuarioName(editedContrato.jefeIngenieriaId)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección 3: Fechas y Plazos */}
        <div className="card mb-8">
          <div className="card-header border-0 py-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon iconName="calendar" className="fs-1 position-absolute ms-6" />
                <h3 className="fw-bold ms-15">Fechas y Plazos</h3>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="row g-6">
              {/* Fechas - Editables por originador */}
              <div className="col-lg-4">
                <label className="form-label fw-semibold fs-6 required">Fecha de Inicio</label>
                {isEditing && esOriginador ? (
                  <input
                    type="date"
                    value={editedContrato.fechaInicio ? editedContrato.fechaInicio.split('T')[0] : ''}
                    onChange={(e) => setEditedContrato({ ...editedContrato, fechaInicio: e.target.value })}
                    className="form-control"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span>{editedContrato.fechaInicio ? new Date(editedContrato.fechaInicio).toLocaleDateString('es-CO') : 'No definida'}</span>
                  </div>
                )}
              </div>

              <div className="col-lg-4">
                <label className="form-label fw-semibold fs-6 required">Fecha de Fin</label>
                {isEditing && esOriginador ? (
                  <input
                    type="date"
                    value={editedContrato.fechaFin ? editedContrato.fechaFin.split('T')[0] : ''}
                    onChange={(e) => setEditedContrato({ ...editedContrato, fechaFin: e.target.value, fechaFinalOriginal: e.target.value })}
                    className="form-control"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span>{editedContrato.fechaFin ? new Date(editedContrato.fechaFin).toLocaleDateString('es-CO') : 'No definida'}</span>
                  </div>
                )}
              </div>

              {/* Plazo calculado - Solo lectura */}
              <div className="col-lg-4">
                <label className="form-label fw-semibold fs-6">Plazo</label>
                <div className="bg-primary bg-opacity-10 rounded p-3 border border-primary border-opacity-25">
                  <span className="fw-bold text-primary fs-5">{calcularPlazo()}</span>
                </div>
              </div>

              {/* Fecha Final Original - Solo lectura */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Fecha Final Original</label>
                <div className="bg-light rounded p-3">
                  <span>{editedContrato.fechaFinalOriginal ? new Date(editedContrato.fechaFinalOriginal).toLocaleDateString('es-CO') : 'No definida'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 4: Valores Económicos */}
        <div className="card mb-8">
          <div className="card-header border-0 py-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon iconName="dollar" className="fs-1 position-absolute ms-6" />
                <h3 className="fw-bold ms-15">Valores Económicos</h3>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            {/* Valores principales editables */}
            <div className="row g-6 mb-8">
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6 required">Valor Costo Directo</label>
                {isEditing && esOriginador ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Valor del costo directo (COP)"
                    value={editedContrato.valorCostoDirecto ? formatCurrency(editedContrato.valorCostoDirecto.toString()) : ''}
                    onChange={(e) => handleChangeCostoDirecto(e.target.value)}
                    className="form-control"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-bold fs-5 text-success">
                      {editedContrato.valorCostoDirecto ? formatCurrency(editedContrato.valorCostoDirecto.toString()) : formatCurrency('0')}
                    </span>
                  </div>
                )}
              </div>

              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6 required">Valor Gastos Reembolsables</label>
                {isEditing && esOriginador ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Valor de gastos reembolsables (COP)"
                    value={editedContrato.valorGastosReembolsables ? formatCurrency(editedContrato.valorGastosReembolsables.toString()) : ''}
                    onChange={(e) => handleChangeGastosRembolsables(e.target.value)}
                    className="form-control"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-bold fs-5 text-info">
                      {editedContrato.valorGastosReembolsables ? formatCurrency(editedContrato.valorGastosReembolsables.toString()) : formatCurrency('0')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Valores de seguimiento - Solo lectura */}
            <div className="row g-6">
              <div className="col-lg-3">
                <div className="card card-flush bg-success bg-opacity-10 border border-success border-opacity-25">
                  <div className="card-body text-center py-6">
                    <KTIcon iconName="dollar" className="fs-1 text-success mb-3" />
                    <div className="fw-bold fs-6 text-gray-800 mb-2">Valor Inicial Costo Directo</div>
                    <div className="fw-bolder fs-4 text-success">
                      {editedContrato.valorInicialCostoDirecto ? formatCurrency(editedContrato.valorInicialCostoDirecto.toString()) : formatCurrency('0')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3">
                <div className="card card-flush bg-info bg-opacity-10 border border-info border-opacity-25">
                  <div className="card-body text-center py-6">
                    <KTIcon iconName="wallet" className="fs-1 text-info mb-3" />
                    <div className="fw-bold fs-6 text-gray-800 mb-2">Valor Inicial Gastos Reembolsables</div>
                    <div className="fw-bolder fs-4 text-info">
                      {editedContrato.valorInicialGastosReembolsables ? formatCurrency(editedContrato.valorInicialGastosReembolsables.toString()) : formatCurrency('0')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3">
                <div className="card card-flush bg-warning bg-opacity-10 border border-warning border-opacity-25">
                  <div className="card-body text-center py-6">
                    <KTIcon iconName="chart-pie-simple" className="fs-1 text-warning mb-3" />
                    <div className="fw-bold fs-6 text-gray-800 mb-2">Valor Comprometido</div>
                    <div className="fw-bolder fs-4 text-warning">
                      {editedContrato.valorComprometido ? formatCurrency(editedContrato.valorComprometido.toString()) : formatCurrency('0')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3">
                <div className="card card-flush bg-primary bg-opacity-10 border border-primary border-opacity-25">
                  <div className="card-body text-center py-6">
                    <KTIcon iconName="bank" className="fs-1 text-primary mb-3" />
                    <div className="fw-bold fs-6 text-gray-800 mb-2">Valor Disponible</div>
                    <div className="fw-bolder fs-4 text-primary">
                      {editedContrato.valorDisponible ? formatCurrency(editedContrato.valorDisponible.toString()) : formatCurrency('0')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3">
                <div className="card card-flush bg-dark bg-opacity-10 border border-dark border-opacity-25">
                  <div className="card-body text-center py-6">
                    <KTIcon iconName="check-circle" className="fs-1 text-dark mb-3" />
                    <div className="fw-bold fs-6 text-gray-800 mb-2">Valor Pagado</div>
                    <div className="fw-bolder fs-4 text-dark">
                      {editedContrato.valorPagado ? formatCurrency(editedContrato.valorPagado.toString()) : formatCurrency('0')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3">
                <div className="card card-flush bg-danger bg-opacity-10 border border-danger border-opacity-25">
                  <div className="card-body text-center py-6">
                    <KTIcon iconName="time" className="fs-1 text-danger mb-3" />
                    <div className="fw-bold fs-6 text-gray-800 mb-2">Valor Falta por Pagar</div>
                    <div className="fw-bolder fs-4 text-danger">
                      {editedContrato.valorFaltaPorPagar ? formatCurrency(editedContrato.valorFaltaPorPagar.toString()) : formatCurrency('0')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="row g-6 mt-6">
              <div className="col-lg-6">
                <div className="bg-light rounded p-4">
                  <div className="d-flex align-items-center">
                    <KTIcon iconName="handcart" className="fs-2 text-muted me-3" />
                    <div>
                      <div className="fw-bold fs-6 text-gray-800">Valor Disponible Gastos Reembolsables</div>
                      <div className="fw-bolder fs-5 text-gray-900">
                        {editedContrato.valorDisponibleGastosReembolsables ? formatCurrency(editedContrato.valorDisponibleGastosReembolsables.toString()) : formatCurrency('0')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="bg-light rounded p-4">
                  <div className="d-flex align-items-center">
                    <KTIcon iconName="file-down" className="fs-2 text-muted me-3" />
                    <div>
                      <div className="fw-bold fs-6 text-gray-800">Número ODSs Suscritas</div>
                      <div className="fw-bolder fs-5 text-gray-900">
                        {editedContrato.numeroOdsSuscritas || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className='row g-5 g-xl-10 mb-10 p-5'>
        <div className='col-xl-12'>
          <AreaChart 
            title="Avance semanal del puntaje total ponderado de los indicadores SECS"
            series={[{ name: 'Puntaje total ponderado', data: getPromedioSECSData().data }]}
            categories={getPromedioSECSData().categories}
          />
        </div>
      </div>

      { (editedContrato.estado !== 0 && editedContrato.estado !== 2) && (
        <>
          <ActasContratoWidget selectedContratoId={selectedContratoId} onUpdate={() => fetchContrato(selectedContratoId)} />
          <AmpliacionesContratoWidget selectedContratoId={selectedContratoId} onUpdate={() => fetchContrato(selectedContratoId)} />
          <SuspensionesContratoWidget selectedContratoId={selectedContratoId} onUpdate={() => fetchContrato(selectedContratoId)} />
          <OrdenesServicioWidget selectedContratoId={selectedContratoId} onUpdate={() => fetchContrato(selectedContratoId)} />
        </>
      )}

      {/* Caja de Confirmación de Edición de Contrato */}
      {modalType === 'edit' && (
        <ModalDialog
          title="Editar Contrato"
          content="¿Estás seguro de que deseas editar este contrato?"
          textBtn="Editar"
          onConfirm={() => updateContrato(editedContrato)}
          closeModal={closeModal}
        />
      )}

      {/* Modal de Aprobación */}
      {modalType === 'approve' && (
        <ModalDialog
          title="Aprobar Contrato"
          content={`¿Estás seguro de que deseas aprobar el contrato "${editedContrato.numero}"?`}
          textBtn="Aprobar"
          onConfirm={() => {setEditedContrato({ ...editedContrato, estaAprobado: true, estaRechazado: false }); closeModal()}}
          closeModal={closeModal}
        />
      )}

      {/* Modal de DesAprobación */}
      {modalType === 'disapprove' && (
        <ModalDialog
          title="Desaprobar Contrato"
          content={`¿Estás seguro de que deseas desaprobar el contrato "${editedContrato.numero}"?`}
          textBtn="Desaprobar"
          onConfirm={() => {setEditedContrato({ ...editedContrato, estaAprobado: false }); closeModal()}}
          closeModal={closeModal}
        />
      )}

      {/* Modal de Rechazo */}
      {modalType === 'reject' && (
        <ModalDialog
          title="Rechazar Contrato"
          content={
            <div>
              <p>¿Estás seguro de que deseas rechazar el contrato "{editedContrato.numero}"?</p>
              <div className="form-group mt-3">
                <label className="form-label">Comentario de Rechazo:</label>
                <textarea
                  placeholder="Ingrese el motivo del rechazo"
                  value={editedContrato.comentarioAprobacion || ''}
                  onChange={(e) => setEditedContrato(prev => ({ ...prev, comentarioAprobacion: e.target.value }))}
                  className="form-control"
                  rows={3}
                  required
                />
              </div>
            </div>
          }
          textBtn="Rechazar"
          confirmButtonClass="btn-warning"
          onConfirm={() => {
            if (!editedContrato.comentarioAprobacion?.trim()) {
              alert("El comentario de rechazo es obligatorio");
              return;
            }
            setEditedContrato({ ...editedContrato, estaRechazado: true, estaAprobado: false });
            closeModal();
          }}
          closeModal={closeModal}
        />
      )}

      {/* Modal de DesRechazo */}
      {modalType === 'unreject' && (
        <ModalDialog
          title="Desrechazar Contrato"
          content={`¿Estás seguro de que deseas desrechazar el contrato "${editedContrato.numero}"?`}
          textBtn="Desrechazar"
          onConfirm={() => {setEditedContrato({ ...editedContrato, estaRechazado: false }); closeModal()}}
          closeModal={closeModal}
        />
      )}

      {/* Caja de Confirmación de Eliminación de Contrato */}
      {modalType === 'delete' && (
        <ModalDialog
          title="Eliminar Contrato"
          content={`¿Estás seguro de que deseas eliminar el contrato ${editedContrato.numero
            }? Tenga en cuenta que esta acción eliminará todas las ODS, Talleres, Actas y Ampliaciones asociadas a este contrato.`}
          textBtn="Eliminar"
          confirmButtonClass="btn-danger"
          onConfirm={deleteContrato}
          closeModal={closeModal}
        />
      )}
      </div>
    </>
  );
}