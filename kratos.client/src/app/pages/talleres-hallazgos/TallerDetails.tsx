import { KTIcon } from "../../../_metronic/helpers";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Taller } from "../../interfaces/talleres-hallazgos/Taller";
import { TipoTaller } from "../../interfaces/talleres-hallazgos/TipoTaller";
import { Empresa } from "../../interfaces/seguridad/Empresa";
import { ODS } from "../../interfaces/contratos-ods/ODS";
import { HitoPago } from "../../interfaces/contratos-ods/HitoPago";
import tallerService from "../../services/talleres-hallazgos/tallerService";
import tipoTallerService from "../../services/talleres-hallazgos/tipoTallerService";
import empresaService from "../../services/seguridad/empresaService";
import odsService from "../../services/contratos-ods/odsService";
import hitoPagoService from "../../services/contratos-ods/hitoPagoService";
import PDFService from "../../services/talleres-hallazgos/PDFService";
import { ModalDialog } from "../components/ModalDialog";
import { HallazgosWidget } from "./HallazgosWidget";
import { useAuth } from "../../modules/auth/AuthContext";

export function TallerDetails({ propsTallerId }: { propsTallerId: number }) {

  const location = useLocation();
  const selectedTallerId = location.state?.propsTallerId || propsTallerId;

  const { role } = useAuth();
  const currentRole = role || '';
  const esOriginador = currentRole === 'Administrador' || currentRole === 'Funcionario Contratista';
  const esAprobador = currentRole === 'Administrador' || currentRole === 'Funcionario Cenit';

  const defaultTaller: Taller = {
    id: 0,
    nombre: '',
    odsId: 0,
    tipoId: 0,
    hitoPagoId: 0,
    fecha: '',
    consultorId: 0,
    proyecto: '',
    liderProyecto: '',
    ejerciciosPrevios: null,
    comentarios: null,
    avanceTipo1: 0,
    avanceTipo2: 0,
    avanceTipo3: 0,
    estado: 0,
    estaAprobado: false,
    estaCancelado: false,
    estaRechazado: false,
    estaFirmado: false,
    comentarioAprobacion: null,
    nombreFirma: null,
    fechaFirma: null
  }

  const [editedTaller, setEditedTaller] = useState<Taller>(defaultTaller)
  const [deleteTallerId, setDeleteTallerId] = useState<number>(defaultTaller.id)

  const [tiposTaller, setTiposTaller] = useState<TipoTaller[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [ordenesServicio, setOrdenesServicio] = useState<ODS[]>([])
  const [hitosDePago, setHitosDePago] = useState<HitoPago[]>([])

  // Modal de Edición/Eliminación
  const [modalType, setModalType] = useState<'delete' | 'edit' | 'approve' | 'disapprove' | 'cancel' | 'uncancel' | 'reject' | 'unreject' | 'sign' | 'unsign' | null>(null)

  // Cerrar el Modal de Edición/Eliminación
  const closeModal = () => setModalType(null)

  const [isEditing, setIsEditing] = useState(false)

  // Funciones helper para obtener nombres y estados
  const getTipoTallerName = (id: number) => {
    const tipo = tiposTaller.find(t => t.id === id);
    return tipo ? tipo.nombre : 'No asignado';
  };

  const getEmpresaName = (id: number) => {
    const empresa = empresas.find(e => e.id === id);
    return empresa ? empresa.nombre : 'No asignado';
  };

  const getODSName = (id: number) => {
    const ods = ordenesServicio.find(o => o.id === id);
    return ods ? ods.nombre : 'No asignado';
  };

  const getHitoPagoNumero = (id: number) => {
    const hito = hitosDePago.find(h => h.id === id);
    return hito ? hito.numero : 'No asignado';
  };

  const getEstadoText = (estado: number) => {
    switch (estado) {
      case 0: return 'Pendiente';
      case 1: return 'En Progreso';
      case 2: return 'Completado';
      case 3: return 'Cancelado';
      case 4: return 'Rechazado';
      case 5: return 'Falta Firma';
      default: return 'Desconocido';
    }
  };

  const getEstadoBadgeClass = (estado: number) => {
    switch (estado) {
      case 0: return 'badge-warning';
      case 1: return 'badge-primary';
      case 2: return 'badge-success';
      case 3: return 'badge-danger';
      case 4: return 'badge-danger';
      case 5: return 'badge-info';
      default: return 'badge-light';
    }
  };

  // Obtener todos los tipos de taller
  const fetchTiposTaller = () => {
    tipoTallerService.getAll()
      .then((response) => {
        setTiposTaller(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los tipos de taller", error)
      })
  }

  // Obtener todas las empresas
  const fetchEmpresas = () => {
    empresaService.getAll()
      .then((response) => {
        setEmpresas(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las empresas", error)
      })
  }

  // Obtener un solo taller (para editar)
  const fetchTaller = (id: number) => {
    tallerService.get(id)
      .then((response) => {
        setEditedTaller(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el taller", error)
      })
  }

  // Obtener todos los hitos de pago
  const fetchHitosDePago = () => {
    hitoPagoService.getAll()
      .then((response) => {
        setHitosDePago(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los hitos de pago", error)
      })
  }

  // Obtener todas las ODS
  const fetchOrdenesServicio = () => {
    odsService.getAll()
      .then((response) => {
        setOrdenesServicio(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las ODS", error)
      })
  }

  // Obtener todos los datos cada vez que se renderiza el componente
  useEffect(() => {
    fetchTiposTaller()
    fetchEmpresas()
    fetchOrdenesServicio()
    fetchHitosDePago()
    fetchTaller(selectedTallerId)
  }, [])

  // Descargar el PDF de los talleres
  const downloadPDF = (id: number) => {
    PDFService.getPDF(id)
      .then((response) => {
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `taller_${id}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url) // Liberar el objeto URL
      })
      .catch((error) => {
        console.error("Hubo un error al descargar el PDF", error)
        alert(`Error al descargar PDF: ${error.response?.data || error.response?.data?.message || error.message}`);
      }
    )
  }

  // Actualizar un taller
  const updateTaller = (data: Taller) => {
    tallerService.update(data)
      .then(() => {
        fetchTaller(data.id)
        setIsEditing(false)
        closeModal() // Cerrar el modal de edición
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el taller", error)
        alert(`Error al actualizar taller: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar un taller
  const deleteTaller = () => {
    tallerService.remove(deleteTallerId)
      .then(() => {
        setDeleteTallerId(defaultTaller.id)
        alert("Taller eliminado exitosamente")
        navigate(-1)
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el taller", error)
        alert(`Error al eliminar taller: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteTallerId(id)
    setModalType('delete')
  }

  const navigate = useNavigate();

  // Filtrar hitos de pago por ODS
  const filteredHitosDePago = editedTaller.odsId ? hitosDePago.filter(hito => hito.odsId === editedTaller.odsId) : hitosDePago

  const calcularAvanceTotal = () => {
  const valores = [
    editedTaller.avanceTipo1,
    editedTaller.avanceTipo2,
    editedTaller.avanceTipo3,
  ].filter(v => v > 0);

  if (valores.length === 0) return 0;
  const suma = valores.reduce((acc, v) => acc + v, 0);
  return Math.round(suma / valores.length);
};
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
            <button onClick={() => downloadPDF(selectedTallerId)} className="btn btn-sm btn-light-secondary" style={{ width: "fit-content" }}>
              <KTIcon iconName="share" className="fs-2" />{" "}
              Exportar a PDF
            </button>
            {isEditing && (
              <button
                onClick={() => setModalType('edit')}
                className="btn btn-sm btn-light-success"
                style={{ width: "fit-content" }}
              >
                <KTIcon iconName="check" className="fs-1" />{" "}
                Guardar Cambios
              </button>
            )}
            {isEditing ? (
              <button onClick={() => {
                setIsEditing(false);
                fetchTaller(selectedTallerId);
              }} className="btn btn-sm btn-light-info"
                style={{ width: "fit-content" }}
              >
                <KTIcon iconName="x" className="fs-2" />{" "}
                Cancelar
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-sm btn-light-info"
                style={{ width: "fit-content" }}
                disabled={editedTaller.estado !== 0 && editedTaller.estado !== 4}
              >
                <KTIcon iconName="pencil" className="fs-2" />{" "}
                Editar
              </button>
            )}
            <button
              onClick={() => openDeleteModal(selectedTallerId)}
              className="btn btn-sm btn-light-danger"
              style={{ width: "fit-content" }}
              disabled={editedTaller.estado !== 0 && editedTaller.estado !== 4}
            >
              <KTIcon iconName="trash" className="fs-2" />{" "}
              Eliminar
            </button>
          </div>
        </div>

        {/* Título y estado */}
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="fw-bolder my-5 ms-5">Detalles del Taller</h1>
          <div className="d-flex gap-3 align-items-center">
            <span className={`badge fs-6 ${getEstadoBadgeClass(editedTaller.estado)}`}>
              {getEstadoText(editedTaller.estado)}
            </span>
          </div>
        </div>

        {/* Sección de Firma - Solo visible cuando falta por firmar */}
        {editedTaller.estado === 5 && (
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
                  <h4 className="mb-1 text-warning">Este taller requiere firma</h4>
                  <span>El taller está pendiente de firma para ser completado.</span>
                </div>
              </div>

              {/* Información de firma existente */}
              {editedTaller.estaFirmado && editedTaller.nombreFirma && (
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
                              <span className="fw-bold">{editedTaller.nombreFirma}</span>
                            </div>
                          </div>
                          <div className="col-lg-6">
                            <label className="form-label fw-semibold fs-6">Fecha de firma:</label>
                            <div className="bg-light rounded p-3">
                              <span>{editedTaller.fechaFirma ? new Date(editedTaller.fechaFirma).toLocaleDateString('es-CO') : 'No definida'}</span>
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
                        id="tallerFirmaSwitch"
                        checked={editedTaller.estaFirmado}
                        onChange={(e) => e.target.checked ? setModalType('sign') : setModalType('unsign')}
                      />
                      <label className="form-check-label fw-bold fs-4" htmlFor="tallerFirmaSwitch">
                        {editedTaller.estaFirmado ? 'Taller Firmado' : 'Firmar Taller'}
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
                        id="tallerDetailCanceladoSwitch"
                        checked={editedTaller.estaCancelado}
                        onChange={(e) => isEditing && (e.target.checked ? setModalType('cancel') : setModalType('uncancel'))}
                        disabled={!isEditing}
                      />
                      <label className="form-check-label fw-semibold fs-6" htmlFor="tallerDetailCanceladoSwitch">
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
                        id="tallerDetailFirmadoSwitch"
                        checked={editedTaller.estaFirmado}
                        onChange={(e) => isEditing && (e.target.checked ? setModalType('sign') : setModalType('unsign'))}
                        disabled={!isEditing}
                      />
                      <label className="form-check-label fw-semibold fs-6" htmlFor="tallerDetailFirmadoSwitch">
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
                        id="tallerDetailAprobadoSwitch"
                        checked={editedTaller.estaAprobado}
                        onChange={(e) => isEditing && (e.target.checked ? setModalType('approve') : setModalType('disapprove'))}
                        disabled={!isEditing}
                      />
                      <label className="form-check-label fw-semibold fs-6" htmlFor="tallerDetailAprobadoSwitch">
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
                        id="tallerDetailRechazadoSwitch"
                        checked={editedTaller.estaRechazado}
                        onChange={(e) => isEditing && (e.target.checked ? setModalType('reject') : setModalType('unreject'))}
                        disabled={!isEditing}
                      />
                      <label className="form-check-label fw-semibold fs-6" htmlFor="tallerDetailRechazadoSwitch">
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
                    value={editedTaller.comentarioAprobacion || ''}
                    onChange={(e) => setEditedTaller({ ...editedTaller, comentarioAprobacion: e.target.value })}
                    className="form-control"
                    rows={3}
                    placeholder="Comentario sobre la aprobación, rechazo o estado del taller"
                  />
                ) : (
                  <div className="bg-light rounded p-4">
                    <span>{editedTaller.comentarioAprobacion || 'Sin comentarios'}</span>
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
                  <span className="fw-bold fs-4 text-primary">{editedTaller.nombre || 'Sin asignar'}</span>
                </div>
              </div>

              {/* ODS - Solo lectura siempre */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">ODS</label>
                <div className="bg-light rounded p-3">
                  <span className="fw-semibold">{getODSName(editedTaller.odsId)}</span>
                </div>
              </div>

              {/* Tipo de Taller - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6 required">Tipo de Taller</label>
                {isEditing && esOriginador ? (
                  <select
                    value={editedTaller.tipoId}
                    onChange={(e) => setEditedTaller({ ...editedTaller, tipoId: parseInt(e.target.value) })}
                    className="form-select"
                    required
                  >
                    <option value="">Seleccione un tipo de taller</option>
                    {tiposTaller.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-semibold">{getTipoTallerName(editedTaller.tipoId)}</span>
                  </div>
                )}
              </div>

              {/* Fecha - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6 required">Fecha</label>
                {isEditing && esOriginador ? (
                  <input
                    type="date"
                    value={editedTaller.fecha ? editedTaller.fecha.split('T')[0] : ''}
                    onChange={(e) => setEditedTaller({ ...editedTaller, fecha: e.target.value })}
                    className="form-control"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span>{editedTaller.fecha ? new Date(editedTaller.fecha).toLocaleDateString('es-CO') : 'No definida'}</span>
                  </div>
                )}
              </div>

              {/* Consultor - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6 required">Consultor</label>
                {isEditing && esOriginador ? (
                  <select
                    value={editedTaller.consultorId}
                    onChange={(e) => setEditedTaller({ ...editedTaller, consultorId: parseInt(e.target.value) })}
                    className="form-select"
                    required
                  >
                    <option value="">Seleccione un consultor</option>
                    {empresas.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-semibold">{getEmpresaName(editedTaller.consultorId)}</span>
                  </div>
                )}
              </div>

              {/* Proyecto - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6 required">Proyecto</label>
                {isEditing && esOriginador ? (
                  <input
                    type="text"
                    value={editedTaller.proyecto}
                    onChange={(e) => setEditedTaller({ ...editedTaller, proyecto: e.target.value })}
                    className="form-control"
                    placeholder="Nombre del proyecto"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span>{editedTaller.proyecto || 'No definido'}</span>
                  </div>
                )}
              </div>

              {/* Líder de Proyecto - Editable por originador */}
              <div className="col-12">
                <label className="form-label fw-semibold fs-6 required">Líder de Proyecto / Originador</label>
                {isEditing && esOriginador ? (
                  <input
                    type="text"
                    value={editedTaller.liderProyecto}
                    onChange={(e) => setEditedTaller({ ...editedTaller, liderProyecto: e.target.value })}
                    className="form-control"
                    placeholder="Nombre del líder de proyecto"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span>{editedTaller.liderProyecto || 'No definido'}</span>
                  </div>
                )}
              </div>

              {/* Hito de Pago - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6 required">Hito de Pago</label>
                {isEditing && esOriginador ? (
                  <select
                    value={editedTaller.hitoPagoId || 0}
                    onChange={(e) => setEditedTaller(prev => ({ ...prev, hitoPagoId: parseInt(e.target.value) || 0 }))}
                    className="form-select"
                    required
                  >
                    <option value={0}>Seleccione un hito de pago</option>
                    {filteredHitosDePago.sort((a, b) => a.numero.localeCompare(b.numero)).map((hito) => (
                      <option key={hito.id} value={hito.id}>
                        {hito.numero}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-semibold">{getHitoPagoNumero(editedTaller.hitoPagoId)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2: Progreso y Avances */}
        <div className="card mb-8">
          <div className="card-header border-0 py-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon iconName="chart-pie-simple" className="fs-1 position-absolute ms-6" />
                <h3 className="fw-bold ms-15">Progreso y Avances</h3>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="row g-6">
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Avance Tipo 1</label>
                <div className="progress" style={{ height: "20px" }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${editedTaller.avanceTipo1}%` }}
                    aria-valuenow={editedTaller.avanceTipo1}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >{editedTaller.avanceTipo1}%</div>
                </div>
              </div>

              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Avance Tipo 2</label>
                <div className="progress" style={{ height: "20px" }}>
                  <div
                    className="progress-bar bg-info"
                    role="progressbar"
                    style={{ width: `${editedTaller.avanceTipo2}%` }}
                    aria-valuenow={editedTaller.avanceTipo2}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >{editedTaller.avanceTipo2}%</div>
                </div>
              </div>

              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Avance Tipo 3</label>
                <div className="progress" style={{ height: "20px" }}>
                  <div
                    className="progress-bar bg-warning"
                    role="progressbar"
                    style={{ width: `${editedTaller.avanceTipo3}%` }}
                    aria-valuenow={editedTaller.avanceTipo3}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >{editedTaller.avanceTipo3}%</div>
                </div>
              </div>

              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Avance Total</label>
                <div className="progress" style={{ height: "20px" }}>
                  <div
                    className="progress-bar bg-danger"
                    role="progressbar"
                    style={{ width: `${calcularAvanceTotal()}%` }}
                    aria-valuenow={calcularAvanceTotal()}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span className="fw-bold">
                      {calcularAvanceTotal()}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 3: Observaciones */}
        <div className="card mb-8">
          <div className="card-header border-0 py-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon iconName="notepad-edit" className="fs-1 position-absolute ms-6" />
                <h3 className="fw-bold ms-15">Observaciones</h3>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="row g-6">
              {/* Ejercicios Previos - Editable por originador */}
              <div className="col-12">
                <label className="form-label fw-semibold fs-6">Ejercicios Previos</label>
                {isEditing && esOriginador ? (
                  <textarea
                    value={editedTaller.ejerciciosPrevios || ''}
                    onChange={(e) => setEditedTaller({ ...editedTaller, ejerciciosPrevios: e.target.value })}
                    className="form-control"
                    rows={3}
                    placeholder="Describa los ejercicios previos realizados"
                  />
                ) : (
                  <div className="bg-light rounded p-4">
                    <span>{editedTaller.ejerciciosPrevios || 'Sin ejercicios previos registrados'}</span>
                  </div>
                )}
              </div>

              {/* Comentarios - Editable por originador */}
              <div className="col-12">
                <label className="form-label fw-semibold fs-6">Comentarios</label>
                {isEditing && esOriginador ? (
                  <textarea
                    value={editedTaller.comentarios || ''}
                    onChange={(e) => setEditedTaller({ ...editedTaller, comentarios: e.target.value })}
                    className="form-control"
                    rows={3}
                    placeholder="Comentarios adicionales sobre el taller"
                  />
                ) : (
                  <div className="bg-light rounded p-4">
                    <span>{editedTaller.comentarios || 'Sin comentarios adicionales'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Widget de Hallazgos - Solo se muestra si el taller está aprobado */}
      {editedTaller.estaAprobado && (
        <HallazgosWidget selectedTallerId={selectedTallerId} onUpdate={() => fetchTaller(selectedTallerId)} />
      )}

      {/* Modales de confirmación */}
      {modalType === 'edit' && (
        <ModalDialog
          title="Editar Taller"
          content="¿Estás seguro de que deseas guardar los cambios realizados?"
          textBtn="Guardar"
          onConfirm={() => updateTaller(editedTaller)}
          closeModal={closeModal}
        />
      )}

      {modalType === 'approve' && (
        <ModalDialog
          title="Aprobar Taller"
          content={`¿Estás seguro de que deseas aprobar el taller "${editedTaller.nombre}"?`}
          textBtn="Aprobar"
          onConfirm={() => { setEditedTaller({ ...editedTaller, estaAprobado: true, estaRechazado: false }); closeModal() }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'disapprove' && (
        <ModalDialog
          title="Desaprobar Taller"
          content={`¿Estás seguro de que deseas desaprobar el taller "${editedTaller.nombre}"?`}
          textBtn="Desaprobar"
          onConfirm={() => { setEditedTaller({ ...editedTaller, estaAprobado: false }); closeModal() }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'cancel' && (
        <ModalDialog
          title="Cancelar Taller"
          content={`¿Estás seguro de que deseas cancelar el taller "${editedTaller.nombre}"?`}
          textBtn="Cancelar"
          onConfirm={() => { setEditedTaller({ ...editedTaller, estaCancelado: true }); closeModal() }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'uncancel' && (
        <ModalDialog
          title="Descancelar Taller"
          content={`¿Estás seguro de que deseas descancelar el taller "${editedTaller.nombre}"?`}
          textBtn="Descancelar"
          onConfirm={() => { setEditedTaller({ ...editedTaller, estaCancelado: false }); closeModal() }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'reject' && (
        <ModalDialog
          title="Rechazar Taller"
          content={
            <div>
              <p>¿Estás seguro de que deseas rechazar el taller "{editedTaller.nombre}"?</p>
              <div className="form-group mt-3">
                <label className="form-label">Comentario de Rechazo:</label>
                <textarea
                  placeholder="Ingrese el motivo del rechazo"
                  value={editedTaller.comentarioAprobacion || ''}
                  onChange={(e) => setEditedTaller(prev => ({ ...prev, comentarioAprobacion: e.target.value }))}
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
            if (!editedTaller.comentarioAprobacion?.trim()) {
              alert("El comentario de rechazo es obligatorio");
              return;
            }
            setEditedTaller({ ...editedTaller, estaRechazado: true, estaAprobado: false });
            closeModal();
          }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'unreject' && (
        <ModalDialog
          title="Desrechazar Taller"
          content={`¿Estás seguro de que deseas desrechazar el taller "${editedTaller.nombre}"?`}
          textBtn="Desrechazar"
          onConfirm={() => { setEditedTaller({ ...editedTaller, estaRechazado: false }); closeModal() }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'sign' && (
        <ModalDialog
          title="Firmar Taller"
          content={`¿Estás seguro de que deseas firmar el taller "${editedTaller.nombre}"?`}
          textBtn="Firmar"
          confirmButtonClass="btn-info"
          onConfirm={() => updateTaller({ ...editedTaller, estaFirmado: true })}
          closeModal={closeModal}
        />
      )}

      {modalType === 'unsign' && (
        <ModalDialog
          title="Desfirmar Taller"
          content={`¿Estás seguro de que deseas desfirmar el taller "${editedTaller.nombre}"?`}
          textBtn="Desfirmar"
          onConfirm={() => updateTaller({ ...editedTaller, estaFirmado: false })}
          closeModal={closeModal}
        />
      )}

      {modalType === 'delete' && (
        <ModalDialog
          title="Eliminar Taller"
          content={`¿Estás seguro de que deseas eliminar el taller "${editedTaller.nombre}"? Esta acción eliminará las Acciones de Cierre y los Hallazgos asociados a este taller.`}
          textBtn="Eliminar"
          confirmButtonClass="btn-danger"
          onConfirm={deleteTaller}
          closeModal={closeModal}
        />
      )}
    </>
  )
}