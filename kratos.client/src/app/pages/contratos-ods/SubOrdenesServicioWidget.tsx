// Interfaces
import { ODS } from "../../interfaces/contratos-ods/ODS"
import { Contrato } from "../../interfaces/contratos-ods/Contrato"
import { Planta } from "../../interfaces/contratos-ods/Planta"
import { Sistema } from "../../interfaces/contratos-ods/Sistema"

// Services
import subODSService from "../../services/contratos-ods/subODSService"
import contratoService from "../../services/contratos-ods/contratoService"
import odsService from "../../services/contratos-ods/odsService"
import plantaService from "../../services/contratos-ods/plantaService"
import sistemaService from "../../services/contratos-ods/sistemaService"

// Components
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { SubODSStepperModal } from "./SubODSStepperModal"

// Helpers
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { useAuth } from "../../modules/auth/AuthContext"

export function SubOrdenesServicioWidget({ selectedODSId, onUpdate }: { selectedODSId: number, onUpdate?: () => void }) {
  
  const { role } = useAuth();
  const currentRole = role || '';
  // const esOriginador = currentRole === 'Administrador' || currentRole === 'Funcionario Contratista';
  const esAprobador = currentRole === 'Administrador' || currentRole === 'Funcionario Cenit';

  const defaultODS: ODS = {
    id: 0,
    nombre: '',
    numeroSeguimientoCenit: '',
    numeroSeguimientoContratista: '',
    contratoId: 0,
    descripcion: '',
    valorHH: 0,
    valorViaje: 0,
    valorEstudio: 0,
    valorSumaGlobalFija: 0,
    valorInicialHH: 0,
    valorInicialViaje: 0,
    valorInicialEstudio: 0,
    valorInicialSumaGlobalFija: 0,
    valorGastoReembolsable: 0,
    porcentajeGastoReembolsable: 0,
    valorDisponible: 0,
    valorHabilitado: 0,
    valorPagado: 0,
    valorFaltaPorPagar: 0,
    fechaInicio: '',
    fechaFinalOriginal: '',
    fechaFin: null,
    fechaRealCierre: null,
    porcentajeRequerimientosCumplidos: null,
    horasHombre: null,
    conexoObra: false,
    estaAprobada: false,
    estaCancelada: false,
    estaSuspendida: false,
    estaRechazada: false,
    comentarioAprobacion: null,
    estado: 0,
    avance: 0,
    odsId: selectedODSId || null,
    contratista: null,
    liderServicioId: null,
    supervisorTecnicoId: null,
    coordinadorODSId: 0,
    SyCcontratistaId: null,
    plantaSistema: false,
    listaPlanta: null,
    listaSistema: null,
    especialidad: null,
    tipoODS: 2,
    recurso: null,
    areaSupervisionTecnica: null,
    complejidad: null,
    paqueteModular: null,
  }
  const [editedODS, setEditedODS] = useState<ODS>(defaultODS)
  const [ordenesServicio, setOrdenesServicio] = useState<ODS[]>([])
  const [deleteODSId, setDeleteODSId] = useState<number>(defaultODS.id)

  const [contratos, setContratos] = useState<Contrato[]>([])
  const [superODS, setSuperODS] = useState<ODS[]>([])
  const [plantas, setPlantas] = useState<Planta[]>([])
  const [sistemas, setSistemas] = useState<Sistema[]>([])

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Modal de Creación/Edición/Eliminación/Aprobación/Rechazo
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | 'approve' | 'disapprove' | 'reject' | 'unreject' | 'cancel' | 'uncancel' | null>(null)

  // Palabra a buscar en el listado de usuarios
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

  // Formatear el número a moneda
  const formatCurrency = (number: number | string | undefined | null) => {
    if (number === undefined || number === null) return '';
    const parsed = typeof number === 'string' ? parseFloat(number.replace(/[^0-9]/g, '')) : number;
    if (isNaN(parsed)) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(parsed);
  };

  // Obtener todos los contratos
  const fetchContratos = () => {
    contratoService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setContratos(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los contratos", error)
      })
  }

  // Obtener todas las ordenes de servicio (super)
  const fetchSuperODS = () => {
    odsService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setSuperODS(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las ordenes de servicio", error)
      })
  }

  // Obtener todas las plantas
  const fetchPlantas = () => {
    plantaService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setPlantas(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las plantas", error)
      })
  }

  // Obtener todos los sistemas
  const fetchSistemas = () => {
    sistemaService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setSistemas(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los sistemas", error)
      })
  }

  // Obtener todas las ordenes de servicio
  const fetchOrdenesServicio = () => {
    subODSService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setOrdenesServicio(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las ordenes de servicio", error)
      })
  }

  // Obtener el contrato asociado a la ods padre seleccionada
  const setContratoParaCrear = () => {
    if (!selectedODSId) return;
    odsService.get(selectedODSId) // Usar odsService para obtener la ODS padre
      .then((response) => {
        const odsPadre = response.data;
        setEditedODS(prev => ({
          ...prev,
          contratoId: odsPadre.contratoId,
          odsId: selectedODSId
        }));
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el contrato de la ODS padre", error);
        setEditedODS(prev => ({
          ...prev,
          contratoId: 0,
          odsId: selectedODSId
        }));
      });
  }

  // Obtener todas las ordenes de servicio cada vez que se renderiza el componente
  useEffect(() => {
    fetchContratos()  // Obtener todos los contratos
    fetchSuperODS()  // Obtener todas las ordenes de servicio (super)
    fetchPlantas()  // Obtener todas las plantas
    fetchSistemas()  // Obtener todos los sistemas
    fetchOrdenesServicio()  // Obtener todas las ordenes de servicio
  }, [])

  // Actualizar el defaultODS y el contrato si cambia la ODS padre seleccionada
  useEffect(() => {
    setEditedODS(prev => ({ ...prev, odsId: selectedODSId || null }));
    if (selectedODSId) {
      setContratoParaCrear(); // Obtener el contrato de la nueva ODS padre
    } else {
      setEditedODS(prev => ({ ...prev, contratoId: 0 })); // Limpiar contratoId si no hay padre
    }
  }, [selectedODSId]);

  // Obtener una sola orden de servicio (para editar)
  const fetchODS = (id: number) => {
    subODSService.get(id)
      .then((response) => {
        setEditedODS(response.data)  // Llenar el formulario de edición
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener la orden de servicio", error)
      })
  }

  // Crear una orden de servicio
  const createODS = (data: ODS) => {
    // Asegurar que odsID (padre) y tipoODS estén correctos
    const dataToSend = {
      ...data,
      coordinadorODSId: superODS.find(ods => ods.id === editedODS.odsId)?.coordinadorODSId || 0,
      liderServicioId: superODS.find(ods => ods.id === editedODS.odsId)?.liderServicioId || null,
      SyCcontratistaId: superODS.find(ods => ods.id === editedODS.odsId)?.SyCcontratistaId || null,
      supervisorTecnicoId: superODS.find(ods => ods.id === editedODS.odsId)?.supervisorTecnicoId || null,
      odsId: selectedODSId || data.odsId,
    };

    console.log(dataToSend)

    // Validar que tipoODS sea uno de los permitidos para SubODS
    if (dataToSend.tipoODS === null || ![2, 3, 4, 5, 6, 7].includes(dataToSend.tipoODS)) {
      alert("Error: Tipo de SubODS inválido.");
      return;
    }

    subODSService.create(dataToSend)
      .then(() => {
        setEditedODS(defaultODS) // Resetear estado unificado
        alert("Servicio creado correctamente")
        closeModal()  // Ocultar el formulario
        fetchOrdenesServicio()  // Actualizar la lista de ordenes de servicio
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al crear el servicio", error)
        alert(`Error al crear servicio: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar una orden de servicio
  const updateODS = (data: ODS) => {
    // Asegurar que odsID (padre) esté correcto si se edita
    const dataToSend = { ...data, odsId: selectedODSId || data.odsId };

    // Validar que tipoODS sea uno de los permitidos para SubODS
    if (dataToSend.tipoODS === null || ![2, 3, 4, 5, 6, 7].includes(dataToSend.tipoODS)) {
      alert("Error: Tipo de SubODS inválido.");
      return;
    }

    subODSService.update(dataToSend)
      .then(() => {
        setEditedODS(defaultODS) // Resetear estado unificado
        alert("Servicio actualizado correctamente")
        closeModal()  // Ocultar el formulario
        fetchOrdenesServicio()  // Actualizar la lista de ordenes de servicio
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el servicio", error)
        alert(`Error al actualizar servicio: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar una orden de servicio
  const deleteODS = () => {
    subODSService.remove(deleteODSId)
      .then(() => {
        setDeleteODSId(defaultODS.id) // Limpiar el input de eliminación
        alert("Servicio eliminado correctamente")
        closeModal()  // Ocultar el formulario
        fetchOrdenesServicio()  // Actualizar la lista de ordenes de servicio
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el servicio", error)
        alert(`Error al eliminar servicio: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteODSId(id)
    setModalType('delete')
  }

  // Funciones para aprobar/rechazar SubODS desde la tabla
  const openApproveModal = (ods: ODS) => {
    setEditedODS(ods)
    setModalType('approve')
  }

  const openRejectModal = (ods: ODS) => {
    setEditedODS(ods)
    setModalType('reject')
  }

  const approveSubODS = () => {
    if (!editedODS || !editedODS.id) {
      alert("Error: Servicio no seleccionado")
      return
    }
    const updatedODS = { ...editedODS, estaAprobada: true, estaRechazada: false }
    odsService.update(updatedODS)
      .then(() => {
        alert("Servicio aprobado exitosamente")
        closeModal()
        fetchOrdenesServicio()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Error al aprobar servicio", error)
        alert(`Error al aprobar servicio: ${error.response?.data || error.message}`)
      })
  }

  const rejectSubODS = () => {
    if (!editedODS || !editedODS.id) {
      alert("Error: Servicio no seleccionado")
      return
    }
    if (!editedODS.comentarioAprobacion?.trim()) {
      alert("El comentario de rechazo es obligatorio")
      return
    }
    const updatedODS = { ...editedODS, estaRechazada: true, estaAprobada: false }
    odsService.update(updatedODS)
      .then(() => {
        alert("Servicio rechazado exitosamente")
        closeModal()
        fetchOrdenesServicio()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Error al rechazar servicio", error)
        alert(`Error al rechazar servicio: ${error.response?.data || error.message}`)
      })
  }

  // Filtrar solo ODS con TipoODS 2, 3, 4 o 5 (Servicio TQ, Servicio ST, MoC o Servicio de Ingeniería)
  const filteredOrdenesServicioByTipoODS = ordenesServicio.filter(ods => ods.tipoODS !== null && [2, 3, 4, 5].includes(ods.tipoODS))

  // Filtrar ordenes de servicio por contratoId
  const filteredOrdenesServicioByContrato = selectedODSId ? filteredOrdenesServicioByTipoODS.filter(ods => ods.odsId === selectedODSId) : filteredOrdenesServicioByTipoODS

  // Filtrar ordenes de servicio por la palabra a buscar incluyendo:
  // nombre, estado, contrato, empresa, valor inicial, valor actual, duración, fecha de inicio, fecha de fin, proyecto y troncal
  const filteredOrdenesServicio = filteredOrdenesServicioByContrato.filter(ods => {
    const searchTermLower = searchTerm.toLowerCase()
    const contrato = contratos.find(c => c.id === ods.contratoId);
    const odsPadre = superODS.find(s => s.id === ods.odsId);
    const fechaInicioStr = ods.fechaInicio ? new Date(ods.fechaInicio).toLocaleDateString('es-CO') : '';
    const fechaFinStr = ods.fechaFin ? new Date(ods.fechaFin).toLocaleDateString('es-CO') : '';
    const duracion = ods.fechaInicio && ods.fechaFin
      ? Math.ceil((new Date(ods.fechaFin).getTime() - new Date(ods.fechaInicio).getTime()) / (1000 * 3600 * 24))
      : null;

    return (
      ods.nombre.toLowerCase().includes(searchTermLower) ||
      contrato?.numero.toLowerCase().includes(searchTermLower) ||
      odsPadre?.nombre.toLowerCase().includes(searchTermLower) ||
      (duracion !== null && duracion.toString().includes(searchTermLower)) ||
      fechaInicioStr.toLowerCase().includes(searchTermLower) ||
      fechaFinStr.toLowerCase().includes(searchTermLower) ||
      ods.descripcion.toLowerCase().includes(searchTermLower) ||
      (ods.estaRechazada && 'rechazado'.includes(searchTermLower))
    )
  })

  // Aplicar paginación a los datos
  const applyPagination = (data: ODS[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a las ODS filtradas
  const shownOrdenesServicio = applyPagination(filteredOrdenesServicio)

  return (
    <>
      {/* Listado de Ordenes de Servicio */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Servicios
          </div>
          <div className="d-flex my-5 gap-3">
            <button
              type='button'
              className='btn btn-sm btn-icon btn-color-primary btn-active-light-primary mx-3'
              data-kt-menu-trigger='click'
              data-kt-menu-placement='bottom-end'
              data-kt-menu-flip='top-end'
            >
              <KTIcon iconName='category' className='fs-3' />
            </button>
            <Dropdown1 />
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-sm btn-light-primary btn-active-primary d-flex" onClick={() => {
              // Resetear estado, asegurar odsID y prellenar contrato/ampliación
              setEditedODS({ ...defaultODS, odsId: selectedODSId || null });
              setContratoParaCrear(); // Llama a la función para obtener datos del padre
              setModalType('create');
            }}>
              <KTIcon iconName="plus" className="fs-3" /> Agregar
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="card-body pb-0">
          <div className="table-responsive">
            {/* Table */}
            <table className="table align-middle gs-0 gy-3">
              {/* Table Head */}
              <thead>
                <tr className='fw-semibold text-muted bg-light fs-6'>
                  <th className='min-w-100px rounded-start ps-5'>Código Servicio</th>
                  <th className='min-w-100px'>Tipo de Servicio</th>
                  <th className='min-w-150px'>Valor Total</th>
                  <th className='min-w-150px'>Plazo</th>
                  <th className='min-w-150px'>Estado</th>
                  <th className='min-w-150px'>Avance</th>
                  <th className='min-w-250px text-end rounded-end pe-5'>Acciones</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {shownOrdenesServicio.map((ods) => (
                  <tr key={ods.id}>
                    <td>
                      <span className="fw-bold fs-6 ps-5">{ods.nombre}</span>
                    </td>
                    <td>
                      <span className="badge badge-light fs-7">
                        {ods.tipoODS === 2 ? 'STI'
                          : ods.tipoODS === 3 ? 'MOC'
                            : ods.tipoODS === 4 ? 'TQ'
                              : ods.tipoODS === 5 ? 'STD'
                                : ods.tipoODS === 6 ? 'RSPA'
                                  : ods.tipoODS === 7 ? 'ING'
                                    : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="text-primary d-block fw-bold fs-6">
                        {formatCurrency(ods.valorSumaGlobalFija)}
                      </span>
                    </td>
                    <td>
                      <span className="d-block text-primary fw-bold fs-6">
                        {ods.fechaInicio && ods.fechaFin ? `${Math.ceil((new Date(ods.fechaFin).getTime() - new Date(ods.fechaInicio).getTime()) / (1000 * 3600 * 24))} días` : 'N/A'}
                      </span>
                      <span className="d-block fs-7">{new Date(ods.fechaInicio).toLocaleDateString('es-CO')}</span>
                      <span className="d-block text-muted fs-7">{ods.fechaFin ? new Date(ods.fechaFin).toLocaleDateString('es-CO') : 'N/A'}</span>
                    </td>
                    <td>
                      <span className={`badge badge-light${ods.estado == 0 ? '-warning' :
                          ods.estado == 1 ? '-info' :
                            ods.estado == 2 ? '-success' :
                              ods.estado == 3 ? '-danger' :
                                ods.estado == 4 ? '-danger' :
                                  ods.estado == 5 ? '-danger' :
                                    ''} fs-7`}>
                        {ods.estado == 0 ? 'Pendiente' :
                          ods.estado == 1 ? 'En Proceso' :
                            ods.estado == 2 ? 'Completada' :
                              ods.estado == 3 ? 'Cancelada' :
                                ods.estado == 4 ? 'Suspendida' :
                                  ods.estado == 5 ? 'Rechazada' :
                                    'Desconocido'}
                      </span>
                      
                      {/* Badges adicionales para aprobación/rechazo */}
                      {ods.estaAprobada && (
                        <div className="mt-1">
                          <span className="badge badge-light-success fs-8">
                            ✓ Aprobada
                          </span>
                        </div>
                      )}
                      {ods.estaRechazada && (
                        <div className="mt-1">
                          <span className="badge badge-light-danger fs-8">
                            ✗ Rechazada
                          </span>
                        </div>
                      )}
                      {ods.estaCancelada && (
                        <div className="mt-1">
                          <span className="badge badge-light-warning fs-8">
                            ⏸ Cancelada
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="text-center">
                      {Math.round(ods.avance)}%
                      <div className="progress" style={{ height: '5px' }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${ods.avance}%` }}
                          aria-valuenow={ods.avance}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </td>
                    <td className="text-end">
                      <Link className="btn btn-icon btn-bg-light btn-active-light-info" to='/contratos-ods/sub-ods-details' state={{ propsODSId: ods.id }}>
                        <KTIcon iconName="eye" className="fs-3" />
                      </Link>
                      <button className="btn btn-icon btn-bg-light btn-active-light-primary ms-3" onClick={() => fetchODS(ods.id)}>
                        <KTIcon iconName="pencil" className="fs-3" />
                      </button>
                      
                      {/* Botones de aprobación/rechazo - Solo para aprobadores */}
                      {esAprobador && (
                        <>
                          {!ods.estaAprobada && (
                            <button 
                              className="btn btn-icon btn-bg-light btn-active-light-success ms-3" 
                              onClick={() => openApproveModal(ods)}
                              title="Aprobar Servicio"
                            >
                              <KTIcon iconName="check" className="fs-3" />
                            </button>
                          )}
                          {!ods.estaRechazada && !ods.estaAprobada && (
                            <button 
                              className="btn btn-icon btn-bg-light btn-active-light-warning ms-3" 
                              onClick={() => openRejectModal(ods)}
                              title="Rechazar Servicio"
                            >
                              <KTIcon iconName="cross" className="fs-3" />
                            </button>
                          )}
                        </>
                      )}

                      <button className="btn btn-icon btn-bg-light btn-active-light-danger ms-3" onClick={() => openDeleteModal(ods.id)}>
                        <KTIcon iconName="trash" className="fs-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        <Pagination
          filteredItems={filteredOrdenesServicio}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Modal Stepper de Creación/Edición de Sub-ODS */}
        <SubODSStepperModal
          show={modalType === 'create' || modalType === 'edit'}
          handleClose={closeModal}
          onSubmit={(ods) => {
            if (modalType === 'create') {
              createODS(ods);
            } else {
              updateODS(ods);
            }
          }}
          modalType={modalType === 'create' ? 'create' : 'edit'}
          initialData={modalType === 'edit' ? editedODS : null}
          plantas={plantas}
          sistemas={sistemas}
          superODS={superODS}
          selectedODSId={selectedODSId}
        />

        {/* Modales de confirmación para switches */}
        {modalType === 'approve' && editedODS.id && (
          <ModalDialog
            title="Aprobar Servicio"
            content={`¿Estás seguro de que deseas aprobar el servicio "${editedODS.nombre}"?`}
            textBtn="Aprobar"
            onConfirm={approveSubODS}
            closeModal={closeModal}
          />
        )}
        {modalType === 'disapprove' && editedODS.id && (
          <ModalDialog
            title="Desaprobar Servicio"
            content={`¿Estás seguro de que deseas desaprobar el servicio "${editedODS.nombre}"?`}
            textBtn="Desaprobar"
            onConfirm={() => { setEditedODS({ ...editedODS, estaAprobada: false }); setModalType('edit'); }}
            closeModal={() => setModalType('edit')}
          />
        )}
        {modalType === 'reject' && editedODS.id && (
          <ModalDialog
            title="Rechazar Servicio"
            content={
              <div>
                <p>¿Estás seguro de que deseas rechazar el servicio "{editedODS.nombre}"?</p>
                <div className="form-group mt-3">
                  <label className="form-label">Comentario de Rechazo:</label>
                  <textarea
                    placeholder="Ingrese el motivo del rechazo"
                    value={editedODS.comentarioAprobacion || ''}
                    onChange={(e) => setEditedODS(prev => ({ ...prev, comentarioAprobacion: e.target.value }))}
                    className="form-control"
                    rows={3}
                    required
                  />
                </div>
              </div>
            }
            textBtn="Rechazar"
            confirmButtonClass="btn-warning"
            onConfirm={rejectSubODS}
            closeModal={closeModal}
          />
        )}
        {modalType === 'unreject' && editedODS.id && (
          <ModalDialog
            title="Desrechazar Servicio"
            content={`¿Estás seguro de que deseas desrechazar el servicio "${editedODS.nombre}"?`}
            textBtn="Desrechazar"
            onConfirm={() => { setEditedODS({ ...editedODS, estaRechazada: false }); setModalType('edit'); }}
            closeModal={() => setModalType('edit')}
          />
        )}
        {modalType === 'cancel' && editedODS.id && (
          <ModalDialog
            title="Cancelar Servicio"
            content={`¿Estás seguro de que deseas cancelar el servicio "${editedODS.nombre}"?`}
            textBtn="Cancelar"
            onConfirm={() => { setEditedODS({ ...editedODS, estaCancelada: true }); setModalType('edit'); }}
            closeModal={() => setModalType('edit')}
          />
        )}
        {modalType === 'uncancel' && editedODS.id && (
          <ModalDialog
            title="Descancelar Servicio"
            content={`¿Estás seguro de que deseas descancelar el servicio "${editedODS.nombre}"?`}
            textBtn="Descancelar"
            onConfirm={() => { setEditedODS({ ...editedODS, estaCancelada: false }); setModalType('edit'); }}
            closeModal={() => setModalType('edit')}
          />
        )}

        {/* Caja de Confirmación de Eliminación de Sub Orden de Servicio */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Eliminar Sub Orden de Servicio"
            content={`¿Está seguro que desea eliminar la Orden de Servicio ${ordenesServicio.find(o => o.id === deleteODSId)?.nombre
              }? Tenga en cuenta que esta acción eliminará todos los Talleres asociados a esta ODS.`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteODS}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}