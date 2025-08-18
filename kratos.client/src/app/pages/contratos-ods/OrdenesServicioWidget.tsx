// Interfaces
import { ODS } from "../../interfaces/contratos-ods/ODS"
import { Usuario } from "../../interfaces/seguridad/Usuario"
import { Contrato } from "../../interfaces/contratos-ods/Contrato"
import { Empresa } from "../../interfaces/seguridad/Empresa"
import { Planta } from "../../interfaces/contratos-ods/Planta"
import { Sistema } from "../../interfaces/contratos-ods/Sistema"

// Services
import odsService from "../../services/contratos-ods/odsService"
import usuarioService from "../../services/seguridad/usuarioService"
import contratoService from "../../services/contratos-ods/contratoService"
import empresaService from "../../services/seguridad/empresaService"
import plantaService from "../../services/contratos-ods/plantaService"
import sistemaService from "../../services/contratos-ods/sistemaService"

// Components
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { ODSStepperModal } from "./ODSStepperModal"

// Helpers
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { useAuth } from "../../modules/auth/AuthContext"


export function OrdenesServicioWidget(
  { selectedContratoId, onUpdate }:
    { selectedContratoId: number, onUpdate?: () => void }
) {

  const { role } = useAuth();
  const currentRole = role || '';
  // const esOriginador = currentRole === 'Administrador' || currentRole === 'Funcionario Contratista';
  const esAprobador = currentRole === 'Administrador' || currentRole === 'Funcionario Cenit';

  const defaultODS: ODS = {
    id: 0,
    nombre: 'ODS000',
    numeroSeguimientoCenit: '',
    numeroSeguimientoContratista: '',
    descripcion: '',
    contratoId: selectedContratoId || 0,
    contratista: '',
    tipoODS: 0,
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
    fechaFin: '',
    fechaRealCierre: null,
    porcentajeRequerimientosCumplidos: null,
    porcentajeAccionesCumplidas: null,
    horasHombre: null,
    estaAprobada: false,
    estaCancelada: false,
    estaSuspendida: false,
    estaRechazada: false,
    comentarioAprobacion: null,
    estado: 0,
    avance: 0,
    plantaSistema: false,
    listaPlanta: null,
    listaSistema: null,
    conexoObra: false,
    odsId: null,
    liderServicioId: null,
    supervisorTecnicoId: null,
    coordinadorODSId: 0,
    SyCcontratistaId: null,
    especialidad: null,
    recurso: null,
    areaSupervisionTecnica: null,
    complejidad: null,
    paqueteModular: null
  }
  const [ordenesServicio, setOrdenesServicio] = useState<ODS[]>([])
  const [editedODS, setEditedODS] = useState<ODS>(defaultODS)
  const [deleteODSId, setDeleteODSId] = useState<number>(defaultODS.id)

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [plantas, setPlantas] = useState<Planta[]>([])
  const [sistemas, setSistemas] = useState<Sistema[]>([])

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // El plazo en días ahora se maneja en el ODSStepperModal

  // Modal de Creación/Edición/Eliminación/Aprobación/Rechazo
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | 'approve' | 'disapprove' | 'reject' | 'unreject' | null>(null)

  // Palabra a buscar en el listado de usuarios
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

  // Los datos de validación ahora se manejan en el ODSStepperModal

  // Formatear el número a moneda (similar a ContratosWidget)
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

  // Las funciones de manejo de campos ahora están en el ODSStepperModal

  // Obtener todos los usuarios
  const fetchUsuarios = () => {
    usuarioService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setUsuarios(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los usuarios", error)
      })
  }

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

  // Obtener todas las empresas
  const fetchEmpresas = () => {
    empresaService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setEmpresas(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las empresas", error)
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
    odsService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setOrdenesServicio(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las ordenes de servicio", error)
      })
  }

  // Obtener todas las ordenes de servicio cada vez que se renderiza el componente
  useEffect(() => {
    fetchUsuarios()  // Obtener todos los usuarios
    fetchContratos()  // Obtener todos los contratos
    fetchEmpresas()  // Obtener todas las empresas
    fetchPlantas()  // Obtener todas las plantas
    fetchSistemas()  // Obtener todos los sistemas
    fetchOrdenesServicio()  // Obtener todas las ordenes de servicio
  }, [])

  // Actualizar el defaultODS si cambia el contrato seleccionado
  useEffect(() => {
    setEditedODS(prev => ({ ...prev, contratoId: selectedContratoId || 0 }));
  }, [selectedContratoId]);

  // Obtener una sola orden de servicio (para editar)
  const fetchODS = (id: number) => {
    odsService.get(id)
      .then((response) => {
        setEditedODS(response.data);
        setModalType('edit');
      })
      .catch((error) => {
        console.error("Hubo un error al obtener la orden de servicio", error)
      })
  }

  // Crear una orden de servicio
  const createODS = (data: ODS) => {

    console.log("Datos a enviar para crear ODS:", data);

    // Calcular valores
    const valorSumaGlobalFija = data.valorHH + data.valorViaje + data.valorEstudio;
    // Para valor disponible, necesitaríamos saber cuánto del valor ya ha sido comprometido
    // Mantenemos el valor disponible tal como viene, a menos que sea nulo
    const valorDisponible = data.valorDisponible !== null ? data.valorDisponible : valorSumaGlobalFija;
    const fechaFinalOriginal = data.fechaFin || '';

    const dataToSend = {
      ...data,
      contratoId: data.contratoId || selectedContratoId,
      valorSumaGlobalFija,
      valorDisponible,
      fechaFinalOriginal
    };

    if (data.contratoId === undefined || data.contratoId === null) {
      console.error("Error: ID de contrato no válido en createODS", data.contratoId);
      alert("Error: El contrato seleccionado no es válido.");
      return; // Detener ejecución si el ID no es válido
    }

    odsService.create(dataToSend)
      .then(() => {
        setEditedODS(defaultODS) // Resetear estado unificado
        alert("Orden de servicio creada exitosamente")
        closeModal()  // Ocultar el formulario
        fetchOrdenesServicio()  // Actualizar la lista
        if (onUpdate) onUpdate(); // Llamar a onUpdate si existe
      })
      .catch((error) => {
        console.error("Hubo un error al crear la orden de servicio", error)
        alert(`Error al crear ODS: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar una orden de servicio
  const updateODS = (data: ODS) => {
    // Calcular valores
    const valorSumaGlobalFija = data.valorHH + data.valorViaje + data.valorEstudio;
    // Para valor disponible, necesitaríamos saber cuánto del valor ya ha sido comprometido
    // Mantenemos el valor disponible tal como viene, a menos que sea nulo
    const valorDisponible = data.valorDisponible !== null ? data.valorDisponible : valorSumaGlobalFija;

    const dataToSend = {
      ...data,
      contratoId: data.contratoId || selectedContratoId,
      valorSumaGlobalFija,
      valorDisponible
    };

    if (data.contratoId === undefined || data.contratoId === null) {
      console.error("Error: ID de contrato no válido en updateODS", data.contratoId);
      alert("Error: El contrato seleccionado no es válido.");
      return; // Detener ejecución si el ID no es válido
    }

    odsService.update(dataToSend)
      .then(() => {
        setEditedODS(defaultODS) // Resetear estado unificado
        alert("Orden de servicio actualizada exitosamente")
        closeModal()  // Ocultar el formulario
        fetchOrdenesServicio()  // Actualizar la lista
        if (onUpdate) onUpdate(); // Llamar a onUpdate si existe
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar la orden de servicio", error)
        alert(`Error al actualizar ODS: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar una orden de servicio
  const deleteODS = () => {
    odsService.remove(deleteODSId)
      .then(() => {
        setDeleteODSId(defaultODS.id) // Limpiar el input de eliminación
        alert("Orden de servicio eliminada exitosamente")
        closeModal()  // Ocultar el formulario
        fetchOrdenesServicio()  // Actualizar la lista de ordenes de servicio
        if (onUpdate) onUpdate(); // Llamar a onUpdate si existe
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar la orden de servicio", error)
        alert(`Error al eliminar ODS: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteODSId(id)
    setModalType('delete')
  }

  // Funciones para aprobar/rechazar ODS desde la tabla
  const openApproveModal = (ods: ODS) => {
    setEditedODS(ods)
    setModalType('approve')
  }

  const openRejectModal = (ods: ODS) => {
    setEditedODS(ods)
    setModalType('reject')
  }

  const approveODS = () => {
    const updatedODS = { ...editedODS, estaAprobada: true, estaRechazada: false }
    odsService.update(updatedODS)
      .then(() => {
        alert("ODS aprobada exitosamente")
        closeModal()
        fetchOrdenesServicio()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Error al aprobar ODS", error)
        alert(`Error al aprobar ODS: ${error.response?.data || error.message}`)
      })
  }

  const rejectODS = () => {
    if (!editedODS.comentarioAprobacion?.trim()) {
      alert("El comentario de rechazo es obligatorio")
      return
    }
    const updatedODS = { ...editedODS, estaRechazada: true, estaAprobada: false }
    odsService.update(updatedODS)
      .then(() => {
        alert("ODS rechazada exitosamente")
        closeModal()
        fetchOrdenesServicio()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Error al rechazar ODS", error)
        alert(`Error al rechazar ODS: ${error.response?.data || error.message}`)
      })
  }

  // Filtrar solo ODS con TipoODS 0 y 1 (ODS Dedicada y ODS de Agregación de Demanda)
  const filteredOrdenesServicioByTipoODS = ordenesServicio.filter(ods => ods.tipoODS === 0 || ods.tipoODS === 1)

  // Filtrar ordenes de servicio por contratoId
  const filteredOrdenesServicioByContrato = selectedContratoId ? filteredOrdenesServicioByTipoODS.filter(ods => ods.contratoId === selectedContratoId) : filteredOrdenesServicioByTipoODS

  // Filtrar ordenes de servicio por la palabra a buscar
  const filteredOrdenesServicio = filteredOrdenesServicioByContrato.filter(ods => {
    const searchTermLower = searchTerm.toLowerCase();
    const contrato = contratos.find(c => c.id === ods.contratoId);
    const fechaInicioStr = ods.fechaInicio ? new Date(ods.fechaInicio).toLocaleDateString('es-CO') : '';
    const fechaFinStr = ods.fechaFin ? new Date(ods.fechaFin).toLocaleDateString('es-CO') : '';
    const fechaRealCierreStr = ods.fechaRealCierre ? new Date(ods.fechaRealCierre).toLocaleDateString('es-CO') : '';
    const duracion = ods.fechaInicio && ods.fechaFin
      ? Math.ceil((new Date(ods.fechaFin).getTime() - new Date(ods.fechaInicio).getTime()) / (1000 * 3600 * 24))
      : null;

    return (
      ods.nombre.toLowerCase().includes(searchTermLower) ||
      ods.numeroSeguimientoCenit?.toLowerCase().includes(searchTermLower) ||
      ods.numeroSeguimientoContratista?.toLowerCase().includes(searchTermLower) ||
      contrato?.numero.toLowerCase().includes(searchTermLower) ||
      ods.contratista?.toLowerCase().includes(searchTermLower) ||
      (duracion !== null && duracion.toString().includes(searchTermLower)) ||
      fechaInicioStr.toLowerCase().includes(searchTermLower) ||
      fechaFinStr.toLowerCase().includes(searchTermLower) ||
      fechaRealCierreStr.toLowerCase().includes(searchTermLower) ||
      ods.descripcion.toLowerCase().includes(searchTermLower) ||
      ods.valorSumaGlobalFija?.toString().includes(searchTermLower) ||
      ods.valorDisponible?.toString().includes(searchTermLower) ||
      ods.valorPagado?.toString().includes(searchTermLower) ||
      ods.valorFaltaPorPagar?.toString().includes(searchTermLower) ||
      ods.porcentajeRequerimientosCumplidos?.toString().includes(searchTermLower) ||
      ods.porcentajeAccionesCumplidas?.toString().includes(searchTermLower) ||
      ods.horasHombre?.toString().includes(searchTermLower) ||
      (ods.estaRechazada && 'rechazado'.includes(searchTermLower))
    );
  });

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
            Ordenes de Servicio
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
              // Resetear estado para creación
              setEditedODS({ ...defaultODS, contratoId: selectedContratoId });
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
                  <th className='min-w-100px rounded-start ps-5'>Número de Consecutivo</th>
                  <th className='min-w-100px'>Tipo de ODS</th>
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
                      <span className="d-block fw-bold fs-6 ps-5">{ods.nombre}</span>
                      <span className="text-muted fs-7 ps-5">
                        {ods.numeroSeguimientoCenit && `Cenit: ${ods.numeroSeguimientoCenit}`}
                      </span>
                      <span className="text-muted fs-7 ps-5">
                        {ods.numeroSeguimientoContratista && `Contratista: ${ods.numeroSeguimientoContratista}`}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-light fs-7">
                        {ods.tipoODS === 0 ? 'Dedicada'
                          : ods.tipoODS === 1 ? 'De Agregación de Demanda'
                            : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="text-primary d-block fw-bold fs-6">
                        {formatCurrency(ods.valorSumaGlobalFija)}
                      </span>
                      <span className="text-muted d-block fs-7">
                        Disponible: {formatCurrency(ods.valorDisponible)}
                      </span>
                      <span className="text-success d-block fs-7">
                        Pagado: {formatCurrency(ods.valorPagado)}
                      </span>
                    </td>
                    <td>
                      <span className="d-block text-primary fw-bold fs-6">
                        {ods.fechaInicio && ods.fechaFin ? `${Math.ceil((new Date(ods.fechaFin).getTime() - new Date(ods.fechaInicio).getTime()) / (1000 * 3600 * 24) + 1)} días` : 'N/A'}
                      </span>
                      <span className="d-block fs-7">{new Date(ods.fechaInicio).toLocaleDateString('es-CO')}</span>
                      <span className="d-block text-muted fs-7">{ods.fechaFin ? new Date(ods.fechaFin).toLocaleDateString('es-CO') : 'N/A'}</span>
                    </td>
                    <td>
                      <span className={`badge badge-light-${ods.estado == 0 ? 'warning' :
                          ods.estado == 1 ? 'info' :
                            ods.estado == 2 ? 'success' :
                              ods.estado == 3 ? 'danger' :
                                ods.estado == 4 ? 'warning' :
                                  ods.estado == 5 ? 'danger' :
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
                      {ods.estaSuspendida && (
                        <div className="mt-1">
                          <span className="badge badge-light-info fs-8">
                            ⏸ Suspendida
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
                      {ods.horasHombre && (
                        <span className="text-muted d-block fs-8 mt-1">
                          {ods.horasHombre} HH
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <Link className="btn btn-icon btn-bg-light btn-active-light-info" to='/contratos-ods/ods-details' state={{ propsODSId: ods.id }}>
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
                              title="Aprobar ODS"
                            >
                              <KTIcon iconName="check" className="fs-3" />
                            </button>
                          )}
                          {!ods.estaRechazada && !ods.estaAprobada && (
                            <button 
                              className="btn btn-icon btn-bg-light btn-active-light-warning ms-3" 
                              onClick={() => openRejectModal(ods)}
                              title="Rechazar ODS"
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

        {/* Modal Stepper de Creación/Edición de ODS */}
        <ODSStepperModal
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
          contratos={contratos}
          empresas={empresas}
          usuarios={usuarios}
          plantas={plantas}
          sistemas={sistemas}
          selectedContratoId={selectedContratoId}
        />

        {/* Caja de Confirmación de Eliminación de ODS */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Eliminar Orden de Servicio"
            content={`¿Estás seguro de que deseas eliminar la ODS "${ordenesServicio.find(o => o.id === deleteODSId)?.nombre
              }"? Esta acción eliminará los talleres, hitos de pago y actas asociadas a esta ODS.`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteODS}
            closeModal={closeModal}
          />
        )}

        {/* Modal de Aprobación */}
        {modalType === 'approve' && (
          <ModalDialog
            title="Aprobar Orden de Servicio"
            content={`¿Estás seguro de que deseas aprobar la ODS "${editedODS.nombre}"?`}
            textBtn="Aprobar"
            confirmButtonClass="btn-success"
            onConfirm={approveODS}
            closeModal={closeModal}
          />
        )}

        {/* Modal de Rechazo */}
        {modalType === 'reject' && (
          <ModalDialog
            title="Rechazar Orden de Servicio"
            content={
              <div>
                <p>¿Estás seguro de que deseas rechazar la ODS "{editedODS.nombre}"?</p>
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
            onConfirm={rejectODS}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}