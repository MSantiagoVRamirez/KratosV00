import { KTIcon } from "../../../_metronic/helpers";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Hallazgo } from "../../interfaces/talleres-hallazgos/Hallazgo";
import { Taller } from "../../interfaces/talleres-hallazgos/Taller";
import { Disciplina } from "../../interfaces/talleres-hallazgos/Disciplina";
import { Usuario } from "../../interfaces/seguridad/Usuario";
import hallazgoService from "../../services/talleres-hallazgos/hallazgoService";
import tallerService from "../../services/talleres-hallazgos/tallerService";
import disciplinaService from "../../services/talleres-hallazgos/disciplinaService";
import usuarioService from "../../services/seguridad/usuarioService";
import { ModalDialog } from "../components/ModalDialog";
import { AccionesCierreWidget } from "./AccionesCierreWidget";
import { useAuth } from "../../modules/auth/AuthContext";

export function HallazgosDetails({ propsHallazgoId }: { propsHallazgoId: number }) {

  const location = useLocation();
  const selectedHallazgoId = location.state?.propsHallazgoId || propsHallazgoId;

  const { role } = useAuth();
  const currentRole = role || '';
  const esOriginador = currentRole === 'Administrador' || currentRole === 'Funcionario Contratista';
  const esAprobador = currentRole === 'Administrador' || currentRole === 'Funcionario Cenit';

  const defaultHallazgo: Hallazgo = {
    id: 0,
    nombre: '',
    recomendacion: '',
    tallerId: 0,
    disciplinaId: 0,
    tipoCategoria: 0,
    responsableAccionId: 0,
    descripcionAccionCierre: null,
    fechaCierrePlaneada: '',
    fechaCierreReal: null,
    documento: null,
    originadorBrechasId: 0,
    ultimoComentarioVerificacionCierre: null,
    estado: 0,
    estaAprobado: false,
    estaCancelado: false,
    estaRechazado: false,
    estaFirmado: false,
    comentarioAprobacion: null,
    nombreFirma: null,
    fechaFirma: null
  }

  const [editedHallazgo, setEditedHallazgo] = useState<Hallazgo>(defaultHallazgo)
  const [deleteHallazgoId, setDeleteHallazgoId] = useState<number>(defaultHallazgo.id)

  const [talleres, setTalleres] = useState<Taller[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  // Modal de Edición/Eliminación
  const [modalType, setModalType] = useState<'delete' | 'edit' | 'approve' | 'disapprove' | 'cancel' | 'uncancel' | 'reject' | 'unreject' | 'sign' | 'unsign' | null>(null)

  // Cerrar el Modal de Edición/Eliminación
  const closeModal = () => setModalType(null)

  const [isEditing, setIsEditing] = useState(false)

  // Funciones helper para obtener nombres y estados
  const getTallerName = (id: number) => {
    const taller = talleres.find(t => t.id === id);
    return taller ? taller.nombre : 'No asignado';
  };

  const getDisciplinaName = (id: number) => {
    const disciplina = disciplinas.find(d => d.id === id);
    return disciplina ? disciplina.nombre : 'No asignada';
  };

  const getUsuarioName = (id: number) => {
    const usuario = usuarios.find(u => u.id === id);
    return usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'No asignado';
  };

  const getTipoCategoriaText = (tipo: number) => {
    switch (tipo) {
      case 0: return 'Tipo 1';
      case 1: return 'Tipo 2';
      case 2: return 'Tipo 3';
      default: return 'No definido';
    }
  };

  const getEstadoText = (estado: number) => {
    switch (estado) {
      case 0: return 'Pendiente';
      case 1: return 'En Proceso';
      case 2: return 'Completado';
      case 3: return 'En Verificación';
      case 4: return 'Cancelado';
      case 5: return 'Rechazado';
      case 6: return 'Falta Firma';
      default: return 'Desconocido';
    }
  };

  const getEstadoBadgeClass = (estado: number) => {
    switch (estado) {
      case 0: return 'badge-warning';
      case 1: return 'badge-primary';
      case 2: return 'badge-success';
      case 3: return 'badge-info';
      case 4: return 'badge-danger';
      case 5: return 'badge-danger';
      case 6: return 'badge-light';
      default: return 'badge-light';
    }
  };

  const calcularDiasRetraso = () => {
    if (editedHallazgo.fechaCierreReal) {
      return Math.round(Math.abs(new Date(editedHallazgo.fechaCierrePlaneada).getTime() - new Date(editedHallazgo.fechaCierreReal).getTime()) / (1000 * 3600 * 24));
    } else {
      const hoy = new Date();
      const fechaPlaneada = new Date(editedHallazgo.fechaCierrePlaneada);
      return Math.round((hoy.getTime() - fechaPlaneada.getTime()) / (1000 * 3600 * 24));
    }
  };

  // Obtener todos los talleres
  const fetchTalleres = () => {
    tallerService.getAll()
      .then((response) => {
        setTalleres(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los talleres", error)
      })
  }

  // Obtener todas las disciplinas
  const fetchDisciplinas = () => {
    disciplinaService.getAll()
      .then((response) => {
        setDisciplinas(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las disciplinas", error)
      })
  }

  // Obtener todos los usuarios
  const fetchUsuarios = () => {
    usuarioService.getAll()
      .then((response) => {
        setUsuarios(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los usuarios", error)
      })
  }

  // Obtener un solo hallazgo (para editar)
  const fetchHallazgo = (id: number) => {
    hallazgoService.get(id)
      .then((response) => {
        setEditedHallazgo(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el hallazgo", error)
      })
  }

  // Obtener todos los datos cada vez que se renderiza el componente
  useEffect(() => {
    fetchTalleres()
    fetchDisciplinas()
    fetchUsuarios()
    fetchHallazgo(selectedHallazgoId)
  }, [])

  // Actualizar un hallazgo
  const updateHallazgo = (data: Hallazgo) => {
    hallazgoService.update(data)
      .then(() => {
        fetchHallazgo(data.id)
        setIsEditing(false)
        closeModal() // Cerrar el modal de edición
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el hallazgo", error)
        alert(`Error al actualizar hallazgo: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar edición
  const openEditModal = () => {
    setModalType('edit')
  }

  // Eliminar un hallazgo
  const deleteHallazgo = () => {
    hallazgoService.remove(deleteHallazgoId)
      .then(() => {
        setDeleteHallazgoId(defaultHallazgo.id)
        alert("Hallazgo eliminado correctamente")
        navigate(-1)
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el hallazgo", error)
        alert(`Error al eliminar hallazgo: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteHallazgoId(id)
    setModalType('delete')
  }

  const navigate = useNavigate();

  const usuariosCenit = usuarios.filter(usuario => usuario.empresaId === 1)

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
              <button onClick={() => openEditModal()} className="btn btn-sm btn-light-success" style={{ width: "fit-content" }}>
                <KTIcon iconName="check" className="fs-1" />{" "}
                Guardar Cambios
              </button>
            )}
            {isEditing ? (
              <button onClick={() => {
                setIsEditing(false);
                fetchHallazgo(selectedHallazgoId);
              }} className="btn btn-sm btn-light-info" style={{ width: "fit-content" }}>
                <KTIcon iconName="x" className="fs-2" />{" "}
                Cancelar
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-sm btn-light-info"
                style={{ width: "fit-content" }}
                disabled={editedHallazgo.estaAprobado}
              >
                <KTIcon iconName="pencil" className="fs-2" />{" "}
                Editar
              </button>
            )}
            <button
              onClick={() => openDeleteModal(selectedHallazgoId)}
              className="btn btn-sm btn-light-danger"
              style={{ width: "fit-content" }}
              disabled={editedHallazgo.estaAprobado}
            >
              <KTIcon iconName="trash" className="fs-2" />{" "}
              Eliminar
            </button>
          </div>
        </div>

        {/* Título y estado */}
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="fw-bolder my-5 ms-5">Detalles del Hallazgo</h1>
          <div className="d-flex gap-3 align-items-center">
            <span className={`badge fs-6 ${getEstadoBadgeClass(editedHallazgo.estado)}`}>
              {getEstadoText(editedHallazgo.estado)}
            </span>
          </div>
        </div>

        {/* Sección de Firma - Solo visible cuando falta por firmar */}
        {editedHallazgo.estado === 6 && (
          <div className="card mb-8 border-warning">
            <div className="card-header border-0 py-6 bg-warning bg-opacity-10">
              <div className="card-title">
                <div className="d-flex align-items-center position-relative my-1">
                  <KTIcon iconName="pencil" className="fs-1 position-absolute ms-6 text-warning" />
                  <h3 className="fw-bold ms-15 text-warning">Firma Requerida</h3>
                </div>
              </div>
            </div>
            <div className="card-body pt-0">
              <div className="alert alert-warning d-flex align-items-center p-5 mb-5">
                <KTIcon iconName="information-5" className="fs-2hx text-warning me-4" />
                <div className="d-flex flex-column">
                  <h4 className="mb-1 text-warning">Este hallazgo requiere firma</h4>
                  <span>El hallazgo está pendiente de firma para ser completado.</span>
                </div>
              </div>

              {/* Información de firma existente */}
              {editedHallazgo.estaFirmado && editedHallazgo.nombreFirma && (
                <div className="row g-6 mb-6">
                  <div className="col-12">
                    <div className="card border-info">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <KTIcon iconName="profile-user" className="fs-2 text-info me-3" />
                          <h5 className="fw-bold text-info mb-0">Información de Firma</h5>
                        </div>
                        <div className="row g-3">
                          <div className="col-lg-6">
                            <label className="form-label fw-semibold fs-6">Firmado por:</label>
                            <div className="bg-light rounded p-3">
                              <span className="fw-bold">{editedHallazgo.nombreFirma}</span>
                            </div>
                          </div>
                          <div className="col-lg-6">
                            <label className="form-label fw-semibold fs-6">Fecha de firma:</label>
                            <div className="bg-light rounded p-3">
                              <span>{editedHallazgo.fechaFirma ? new Date(editedHallazgo.fechaFirma).toLocaleDateString('es-CO') : 'No definida'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {esAprobador && (
                <div className="row g-6">
                  <div className="col-12">
                    <div className="form-check form-switch form-check-custom form-check-warning form-check-solid d-flex align-items-center">
                      <input
                        className="form-check-input me-3"
                        type="checkbox"
                        role="switch"
                        id="hallazgoFirmaSwitch"
                        checked={editedHallazgo.estaFirmado}
                        onChange={(e) => e.target.checked ? setModalType('sign') : setModalType('unsign')}
                      />
                      <label className="form-check-label fw-bold fs-4" htmlFor="hallazgoFirmaSwitch">
                        {editedHallazgo.estaFirmado ? 'Hallazgo Firmado' : 'Firmar Hallazgo'}
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sección 4: Estado y Aprobación */}
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
              {/* Controles para originadores */}
              {esOriginador && (
                <>
                  <div className="col-lg-6">
                    <div className="form-check form-switch form-check-custom form-check-warning form-check-solid">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="hallazgoDetailCanceladoSwitch"
                        checked={editedHallazgo.estaCancelado}
                        onChange={(e) => isEditing && (e.target.checked ? setModalType('cancel') : setModalType('uncancel'))}
                        disabled={!isEditing}
                        />
                      <label className="form-check-label fw-semibold fs-6" htmlFor="hallazgoDetailCanceladoSwitch">
                        Cancelado
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-check form-switch form-check-custom form-check-info form-check-solid">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="hallazgoDetailFirmadoSwitch"
                        checked={editedHallazgo.estaFirmado}
                        onChange={(e) => isEditing && (e.target.checked ? setModalType('sign') : setModalType('unsign'))}
                        disabled={!isEditing}
                        />
                      <label className="form-check-label fw-semibold fs-6" htmlFor="hallazgoDetailFirmadoSwitch">
                        Firmado
                      </label>
                    </div>
                  </div>
                </>
              )}
              {/* Controles para aprobadores */}
              {esAprobador && (
                <>
                  <div className="col-lg-6">
                    <div className="form-check form-switch form-check-custom form-check-success form-check-solid">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="hallazgoDetailAprobadoSwitch"
                        checked={editedHallazgo.estaAprobado}
                        onChange={(e) => isEditing && (e.target.checked ? setModalType('approve') : setModalType('disapprove'))}
                        disabled={!isEditing}
                      />
                      <label className="form-check-label fw-semibold fs-6" htmlFor="hallazgoDetailAprobadoSwitch">
                        Aprobado
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-check form-switch form-check-custom form-check-danger form-check-solid">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="hallazgoDetailRechazadoSwitch"
                        checked={editedHallazgo.estaRechazado}
                        onChange={(e) => isEditing && (e.target.checked ? setModalType('reject') : setModalType('unreject'))}
                        disabled={!isEditing}
                      />
                      <label className="form-check-label fw-semibold fs-6" htmlFor="hallazgoDetailRechazadoSwitch">
                        Rechazado
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Comentario de aprobación */}
              <div className="col-12">
                <label className="form-label fw-semibold fs-6">Comentario de Aprobación</label>
                {isEditing && esAprobador ? (
                  <textarea
                    value={editedHallazgo.comentarioAprobacion || ''}
                    onChange={(e) => setEditedHallazgo({ ...editedHallazgo, comentarioAprobacion: e.target.value })}
                    className="form-control"
                    rows={3}
                    placeholder="Comentario sobre la aprobación, rechazo o estado del hallazgo"
                  />
                ) : (
                  <div className="bg-light rounded p-4">
                    <span>{editedHallazgo.comentarioAprobacion || 'Sin comentarios'}</span>
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
              {/* Número de Consecutivo - Solo lectura siempre */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Número de Consecutivo</label>
                <div className="bg-light rounded p-3">
                  <span className="fw-bold fs-4 text-primary">{editedHallazgo.nombre || 'Sin asignar'}</span>
                </div>
              </div>

              {/* Taller - Solo lectura siempre */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Taller</label>
                <div className="bg-light rounded p-3">
                  <span className="fw-semibold">{getTallerName(editedHallazgo.tallerId)}</span>
                </div>
              </div>

              {/* Disciplina - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6 required">Disciplina</label>
                {isEditing && esOriginador ? (
                  <select
                    value={editedHallazgo.disciplinaId}
                    onChange={(e) => setEditedHallazgo({ ...editedHallazgo, disciplinaId: parseInt(e.target.value) })}
                    className="form-select"
                    required
                  >
                    <option value="">Seleccione una disciplina</option>
                    {disciplinas.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((disciplina) => (
                      <option key={disciplina.id} value={disciplina.id}>
                        {disciplina.nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-semibold">{getDisciplinaName(editedHallazgo.disciplinaId)}</span>
                  </div>
                )}
              </div>

              {/* Tipo de Categoría - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6 required">Tipo de Categoría</label>
                {isEditing && esOriginador ? (
                  <select
                    value={editedHallazgo.tipoCategoria}
                    onChange={(e) => setEditedHallazgo({ ...editedHallazgo, tipoCategoria: parseInt(e.target.value) })}
                    className="form-select"
                    required
                  >
                    <option value="">Seleccione un tipo de categoría</option>
                    <option value={0}>Tipo 1</option>
                    <option value={1}>Tipo 2</option>
                    <option value={2}>Tipo 3</option>
                  </select>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-semibold">{getTipoCategoriaText(editedHallazgo.tipoCategoria)}</span>
                  </div>
                )}
              </div>

              {/* Responsable de Acción - Solo lectura siempre */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Responsable de Acción</label>
                <div className="bg-light rounded p-3">
                  <span className="fw-semibold">{getUsuarioName(editedHallazgo.responsableAccionId)}</span>
                </div>
              </div>

              {/* Originador de Brechas - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6 required">Originador de Brechas</label>
                {isEditing && esOriginador ? (
                  <select
                    value={editedHallazgo.originadorBrechasId}
                    onChange={(e) => setEditedHallazgo({ ...editedHallazgo, originadorBrechasId: parseInt(e.target.value) })}
                    className="form-select"
                    required
                  >
                    <option value="">Seleccione un originador</option>
                    {usuariosCenit.sort((a, b) => `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`)).map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombres} {usuario.apellidos}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-semibold">{getUsuarioName(editedHallazgo.originadorBrechasId)}</span>
                  </div>
                )}
              </div>

              {/* Recomendación - Editable por originador */}
              <div className="col-12">
                <label className="form-label fw-semibold fs-6 required">Recomendación</label>
                {isEditing && esOriginador ? (
                  <textarea
                    value={editedHallazgo.recomendacion}
                    onChange={(e) => setEditedHallazgo({ ...editedHallazgo, recomendacion: e.target.value })}
                    className="form-control"
                    rows={3}
                    placeholder="Describa la recomendación del hallazgo"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-4">
                    <span>{editedHallazgo.recomendacion || 'No definida'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2: Fechas y Seguimiento */}
        <div className="card mb-8">
          <div className="card-header border-0 py-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon iconName="calendar" className="fs-1 position-absolute ms-6" />
                <h3 className="fw-bold ms-15">Fechas y Seguimiento</h3>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="row g-6">
              {/* Fecha de Cierre Planeada - Editable por originador */}
              <div className="col-lg-4">
                <label className="form-label fw-semibold fs-6 required">Fecha de Cierre Planeada</label>
                {isEditing && esOriginador ? (
                  <input
                    type="date"
                    value={editedHallazgo.fechaCierrePlaneada ? editedHallazgo.fechaCierrePlaneada.split("T")[0] : ""}
                    onChange={(e) => setEditedHallazgo({ ...editedHallazgo, fechaCierrePlaneada: e.target.value })}
                    className="form-control"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span>{editedHallazgo.fechaCierrePlaneada ? new Date(editedHallazgo.fechaCierrePlaneada).toLocaleDateString('es-CO') : 'No definida'}</span>
                  </div>
                )}
              </div>

              {/* Fecha de Cierre Real - Editable por originador */}
              <div className="col-lg-4">
                <label className="form-label fw-semibold fs-6">Fecha de Cierre Real</label>
                {isEditing && esOriginador ? (
                  <input
                    type="date"
                    value={editedHallazgo.fechaCierreReal ? editedHallazgo.fechaCierreReal.split("T")[0] : ""}
                    onChange={(e) => setEditedHallazgo({ ...editedHallazgo, fechaCierreReal: e.target.value })}
                    className="form-control"
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span>{editedHallazgo.fechaCierreReal ? new Date(editedHallazgo.fechaCierreReal).toLocaleDateString('es-CO') : 'No definida'}</span>
                  </div>
                )}
              </div>

              {/* Días de Retraso - Solo lectura (calculado) */}
              <div className="col-lg-4">
                <label className="form-label fw-semibold fs-6">Días de Retraso</label>
                <div className={`bg-${calcularDiasRetraso() > 0 ? 'danger' : 'success'} bg-opacity-10 rounded p-3 border border-${calcularDiasRetraso() > 0 ? 'danger' : 'success'} border-opacity-25`}>
                  <span className={`fw-bold fs-4 text-${calcularDiasRetraso() > 0 ? 'danger' : 'success'}`}>
                    {calcularDiasRetraso()} días
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 3: Acciones de Cierre */}
        <div className="card mb-8">
          <div className="card-header border-0 py-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon iconName="notepad-edit" className="fs-1 position-absolute ms-6" />
                <h3 className="fw-bold ms-15">Acciones de Cierre</h3>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="row g-6">
              {/* Descripción de Acción de Cierre - Editable por originador */}
              <div className="col-12">
                <label className="form-label fw-semibold fs-6">Descripción de Acción de Cierre</label>
                {isEditing && esOriginador ? (
                  <textarea
                    value={editedHallazgo.descripcionAccionCierre || ""}
                    onChange={(e) => setEditedHallazgo({ ...editedHallazgo, descripcionAccionCierre: e.target.value })}
                    className="form-control"
                    rows={3}
                    placeholder="Describa la acción de cierre a realizar"
                  />
                ) : (
                  <div className="bg-light rounded p-4">
                    <span>{editedHallazgo.descripcionAccionCierre || 'Sin descripción'}</span>
                  </div>
                )}
              </div>

              {/* Último Comentario de Verificación - Editable por originador */}
              <div className="col-12">
                <label className="form-label fw-semibold fs-6">Último Comentario de Verificación</label>
                {isEditing && esOriginador ? (
                  <textarea
                    value={editedHallazgo.ultimoComentarioVerificacionCierre || ""}
                    onChange={(e) => setEditedHallazgo({ ...editedHallazgo, ultimoComentarioVerificacionCierre: e.target.value })}
                    className="form-control"
                    rows={3}
                    placeholder="Comentario sobre la verificación del cierre"
                  />
                ) : (
                  <div className="bg-light rounded p-4">
                    <span>{editedHallazgo.ultimoComentarioVerificacionCierre || 'Sin comentarios'}</span>
                  </div>
                )}
              </div>

              {/* Documento - Editable por originador */}
              <div className="col-12">
                <label className="form-label fw-semibold fs-6">Documento</label>
                {isEditing && esOriginador ? (
                  <div>
                    {editedHallazgo.documento && (
                      <div className="mb-2">
                        <span className="badge badge-light-info me-2">Actual:</span>
                        <span>{editedHallazgo.documento}</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setEditedHallazgo(prev => ({ ...prev, documento: e.target.files![0].name }));
                        }
                      }}
                      className="form-control"
                    />
                    <div className="text-muted fs-7 mt-1">Seleccione un archivo PDF.</div>
                  </div>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span>{editedHallazgo.documento || 'Sin documento'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Widget de Acciones de Cierre - Solo se muestra si el hallazgo está aprobado */}
      {editedHallazgo.estaAprobado && (
        <AccionesCierreWidget selectedHallazgoId={selectedHallazgoId} onUpdate={() => fetchHallazgo(selectedHallazgoId)} />
      )}

      {/* Modales de confirmación */}
      {modalType === 'edit' && (
        <ModalDialog
          title="Editar Hallazgo"
          content="¿Estás seguro de que deseas guardar los cambios realizados?"
          textBtn="Guardar"
          onConfirm={() => updateHallazgo(editedHallazgo)}
          closeModal={closeModal}
        />
      )}

      {modalType === 'approve' && (
        <ModalDialog
          title="Aprobar Hallazgo"
          content={`¿Estás seguro de que deseas aprobar el hallazgo "${editedHallazgo.nombre}"?`}
          textBtn="Aprobar"
          onConfirm={() => { setEditedHallazgo({ ...editedHallazgo, estaAprobado: true, estaRechazado: false }); closeModal() }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'disapprove' && (
        <ModalDialog
          title="Desaprobar Hallazgo"
          content={`¿Estás seguro de que deseas desaprobar el hallazgo "${editedHallazgo.nombre}"?`}
          textBtn="Desaprobar"
          onConfirm={() => { setEditedHallazgo({ ...editedHallazgo, estaAprobado: false }); closeModal() }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'cancel' && (
        <ModalDialog
          title="Cancelar Hallazgo"
          content={`¿Estás seguro de que deseas cancelar el hallazgo "${editedHallazgo.nombre}"?`}
          textBtn="Cancelar"
          onConfirm={() => { setEditedHallazgo({ ...editedHallazgo, estaCancelado: true }); closeModal() }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'uncancel' && (
        <ModalDialog
          title="Descancelar Hallazgo"
          content={`¿Estás seguro de que deseas descancelar el hallazgo "${editedHallazgo.nombre}"?`}
          textBtn="Descancelar"
          onConfirm={() => { setEditedHallazgo({ ...editedHallazgo, estaCancelado: false }); closeModal() }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'reject' && (
        <ModalDialog
          title="Rechazar Hallazgo"
          content={
            <div>
              <p>¿Estás seguro de que deseas rechazar el hallazgo "{editedHallazgo.nombre}"?</p>
              <div className="form-group mt-3">
                <label className="form-label">Comentario de Rechazo:</label>
                <textarea
                  placeholder="Ingrese el motivo del rechazo"
                  value={editedHallazgo.comentarioAprobacion || ''}
                  onChange={(e) => setEditedHallazgo(prev => ({ ...prev, comentarioAprobacion: e.target.value }))}
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
            if (!editedHallazgo.comentarioAprobacion?.trim()) {
              alert("El comentario de rechazo es obligatorio");
              return;
            }
            setEditedHallazgo({ ...editedHallazgo, estaRechazado: true, estaAprobado: false });
            closeModal();
          }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'unreject' && (
        <ModalDialog
          title="Desrechazar Hallazgo"
          content={`¿Estás seguro de que deseas desrechazar el hallazgo "${editedHallazgo.nombre}"?`}
          textBtn="Desrechazar"
          onConfirm={() => { setEditedHallazgo({ ...editedHallazgo, estaRechazado: false }); closeModal() }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'sign' && (
        <ModalDialog
          title="Firmar Hallazgo"
          content={`¿Estás seguro de que deseas firmar el hallazgo "${editedHallazgo.nombre}"?`}
          textBtn="Firmar"
          confirmButtonClass="btn-info"
          onConfirm={() => updateHallazgo({ ...editedHallazgo, estaFirmado: true })}
          closeModal={closeModal}
        />
      )}

      {modalType === 'unsign' && (
        <ModalDialog
          title="Desfirmar Hallazgo"
          content={`¿Estás seguro de que deseas desfirmar el hallazgo "${editedHallazgo.nombre}"?`}
          textBtn="Desfirmar"
          onConfirm={() => updateHallazgo({ ...editedHallazgo, estaFirmado: false })}
          closeModal={closeModal}
        />
      )}

      {modalType === 'delete' && (
        <ModalDialog
          title="Eliminar Hallazgo"
          content={`¿Estás seguro de que deseas eliminar el hallazgo "${editedHallazgo.nombre}"? Esta acción eliminará las acciones de cierre asociadas al hallazgo.`}
          textBtn="Eliminar"
          confirmButtonClass="btn-danger"
          onConfirm={deleteHallazgo}
          closeModal={closeModal}
        />
      )}
    </>
  )
}