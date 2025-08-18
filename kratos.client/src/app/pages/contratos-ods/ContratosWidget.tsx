import { useState, useEffect } from "react"
import { Contrato } from "../../interfaces/contratos-ods/Contrato"
import { Empresa } from "../../interfaces/seguridad/Empresa"
import { Usuario } from "../../interfaces/seguridad/Usuario"
import contratoService from "../../services/contratos-ods/contratoService"
import empresaService from "../../services/seguridad/empresaService"
import usuarioService from "../../services/seguridad/usuarioService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Link } from "react-router-dom"
import { Pagination } from "../components/Pagination"
import { ContratoStepperModal } from "./ContratoStepperModal"
import { useAuth } from "../../modules/auth/AuthContext"

export function ContratosWidget() {

  const { role } = useAuth();
  const currentRole = role || '';
  // const esOriginador = currentRole === 'Administrador' || currentRole === 'S&C Cenit';
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
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [editedContrato, setEditedContrato] = useState<Contrato>(defaultContrato)
  const [deleteContratoId, setDeleteContratoId] = useState<number>(defaultContrato.id)

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Modal de Creación/Edición/Eliminación/Aprobación/Rechazo
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | 'restart' | 'approve' | 'disapprove' | 'reject' | 'unreject' | null>(null)

  // Palabra a buscar en el listado de usuarios
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

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

  // Obtener todos los contratos cada vez que se renderiza el componente
  useEffect(() => {
    fetchEmpresas()  // Obtener todas las empresas
    fetchUsuarios()  // Obtener todos los usuarios
    fetchContratos()  // Obtener todos los contratos
  }, [])

  // Obtener un solo contrato (para editar)
  const fetchContrato = (id: number) => {
    contratoService.get(id)
      .then((response) => {
        setEditedContrato(response.data)  // Llenar el estado unificado
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el contrato", error)
      })
  }

  // Crear un contrato
  const createContrato = (data: Contrato) => {
    contratoService.create(data)
      .then(() => {
        setEditedContrato(defaultContrato) // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchContratos()  // Actualizar la lista de contratos
        alert("Contrato creado exitosamente")
      })
      .catch((error) => {
        console.error("Hubo un error al crear el contrato", error)
        alert(`Error al crear contrato: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar un contrato
  const updateContrato = (data: Contrato) => {
    contratoService.update(data)
      .then(() => {
        setEditedContrato(defaultContrato) // Resetear estado unificado
        alert("Contrato actualizado exitosamente")
        closeModal()  // Ocultar el formulario
        fetchContratos()  // Actualizar la lista de contratos
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el contrato", error)
        alert(`Error al actualizar contrato: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar un contrato
  const deleteContrato = () => {
    contratoService.remove(deleteContratoId)
      .then(() => {
        setDeleteContratoId(defaultContrato.id) // Limpiar el input de eliminación
        alert("Contrato eliminado exitosamente")
        closeModal()  // Ocultar el formulario
        fetchContratos()  // Actualizar la lista de contratos
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

  // Funciones para aprobar/rechazar contratos desde la tabla
  const openApproveModal = (contrato: Contrato) => {
    setEditedContrato(contrato)
    setModalType('approve')
  }

  const openRejectModal = (contrato: Contrato) => {
    setEditedContrato(contrato)
    setModalType('reject')
  }

  const approveContrato = () => {
    const updatedContrato = { ...editedContrato, estaAprobado: true, estaRechazado: false }
    contratoService.update(updatedContrato)
      .then(() => {
        alert("Contrato aprobado exitosamente")
        closeModal()
        fetchContratos()
      })
      .catch((error) => {
        console.error("Error al aprobar contrato", error)
        alert(`Error al aprobar contrato: ${error.response?.data || error.message}`)
      })
  }

  const rejectContrato = () => {
    if (!editedContrato.comentarioAprobacion?.trim()) {
      alert("El comentario de rechazo es obligatorio")
      return
    }
    const updatedContrato = { ...editedContrato, estaRechazado: true, estaAprobado: false }
    contratoService.update(updatedContrato)
      .then(() => {
        alert("Contrato rechazado exitosamente")
        closeModal()
        fetchContratos()
      })
      .catch((error) => {
        console.error("Error al rechazar contrato", error)
        alert(`Error al rechazar contrato: ${error.response?.data || error.message}`)
      })
  }

  // Filtrar contratos por la palabra a buscar incluyendo:
  // numero, objeto, empresa, usuario asigna, valor, duración, fecha de inicio, fecha de fin y estados
  const filteredContratos = contratos.filter(contrato => {
    const fechaInicio = new Date(contrato.fechaInicio).toLocaleDateString().toLowerCase()
    const fechaFin = new Date(contrato.fechaFin).toLocaleDateString().toLowerCase()
    const estadoTexto = contrato.estado === 0 ? 'pendiente' : 
                       contrato.estado === 1 ? 'en proceso' : 
                       contrato.estado === 2 ? 'rechazado' : 
                       contrato.estado === 3 ? 'completado' : 
                       contrato.estado === 4 ? 'suspendido' : 'desconocido';

    return (
      contrato.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contrato.numeroSeguimientoCenit && contrato.numeroSeguimientoCenit.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contrato.numeroSeguimientoContratista && contrato.numeroSeguimientoContratista.toLowerCase().includes(searchTerm.toLowerCase())) ||
      contrato.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresas.find(empresa => empresa.id === contrato.empresaId)?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((contrato.valorCostoDirecto + contrato.valorGastosReembolsables)?.toString().includes(searchTerm)) ||
      (contrato.valorPagado?.toString().includes(searchTerm)) ||
      (contrato.valorFaltaPorPagar?.toString().includes(searchTerm)) ||
      (contrato.fechaInicio && contrato.fechaFin ? Math.ceil((new Date(contrato.fechaFin).getTime() - new Date(contrato.fechaInicio).getTime()) / (1000 * 3600 * 24)) : 0).toString().includes(searchTerm.toLowerCase()) ||
      fechaInicio.includes(searchTerm) ||
      fechaFin.includes(searchTerm) ||
      estadoTexto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contrato.estaAprobado ? 'aprobado' : '').includes(searchTerm.toLowerCase()) ||
      (contrato.estaRechazado ? 'rechazado' : '').includes(searchTerm.toLowerCase()) ||
      (contrato.estaSuspendido ? 'suspendido' : '').includes(searchTerm.toLowerCase())
    )
  })

  // Aplicar paginación a los datos
  const applyPagination = (data: Contrato[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a los contratos filtrados
  const shownContratos = applyPagination(filteredContratos)

  // Formatear el número a moneda
  const formatCurrency = (number: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const filtered_empresas = empresas.filter(empresa => empresa.nombre !== 'Cenit')

  return (
    <>
      {/* Listado de Contratos */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Contratos
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
              setEditedContrato(defaultContrato); // Resetear estado al abrir creación
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
                  <th className='min-w-100px rounded-start ps-5'>Número</th>
                  <th className='min-w-150px'>Consultor</th>
                  <th className='min-w-150px'>Valor Total</th>
                  <th className='min-w-150px'>Plazo</th>
                  <th className='min-w-100px text-center'>Estado</th>
                  <th className='min-w-250px text-end rounded-end pe-5'>Acciones</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {shownContratos.map((contrato) => (
                  <tr key={contrato.id}>
                    <td className="ps-5">
                      <span className="d-block fw-bold fs-6">{contrato.numero}</span>
                      <span className="d-block text-muted fs-7">
                        {contrato.numeroSeguimientoCenit && `Cenit: ${contrato.numeroSeguimientoCenit}`}
                      </span>
                      <span className="d-block text-muted fs-7">
                        {contrato.numeroSeguimientoContratista && `Contratista: ${contrato.numeroSeguimientoContratista}`}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-light fs-7" style={{ width: 'fit-content' }}>
                        {empresas.find(empresa => empresa.id === contrato.empresaId)?.nombre}
                      </span>
                    </td>
                    <td>
                      <span className={`d-block fw-bold fs-6 text-${contrato.valorDisponible ? contrato.valorDisponible <= 0 ? 'danger' : 'primary' : 'danger'}`}>
                        {formatCurrency(contrato.valorCostoDirecto + contrato.valorGastosReembolsables)}
                      </span>
                      <span className="text-muted d-block fs-7">
                        Disponible: {formatCurrency(contrato.valorDisponible ?? 0)}
                      </span>
                      <span className="text-success d-block fs-7">
                        Pagado: {formatCurrency(contrato.valorPagado ?? 0)}
                      </span>
                    </td>
                    <td>
                      <span className="d-block text-primary fw-bold fs-6">
                        {contrato.fechaInicio && contrato.fechaFin ? Math.ceil((new Date(contrato.fechaFin).getTime() - new Date(contrato.fechaInicio).getTime()) / (1000 * 3600 * 24) + 1) : 0} días
                      </span>
                      <span className="d-block fs-7">{new Date(contrato.fechaInicio).toLocaleDateString('es-CO')}</span>
                      <span className="d-block text-muted fs-7">{new Date(contrato.fechaFin).toLocaleDateString('es-CO')}</span>
                    </td>
                    <td className="text-center">
                      <span className={`badge badge-light-${contrato.estado === 0 ? 'secondary' :
                          contrato.estado === 1 ? 'primary' :
                            contrato.estado === 2 ? 'danger' :
                              contrato.estado === 3 ? 'success' :
                                contrato.estado === 4 ? 'warning' :
                                  ''} fs-7`}>
                        {contrato.estado === 0 ? 'Pendiente' :
                          contrato.estado === 1 ? 'En Proceso' :
                            contrato.estado === 2 ? 'Rechazado' :
                              contrato.estado === 3 ? 'Completado' :
                                contrato.estado === 4 ? 'Suspendido' :
                                  'Desconocido'}
                      </span>
                      
                      {/* Badges adicionales para aprobación/rechazo */}
                      {contrato.estaAprobado && (
                        <div className="mt-1">
                          <span className="badge badge-light-success fs-8">
                            ✓ Aprobado
                          </span>
                        </div>
                      )}
                      {contrato.estaRechazado && (
                        <div className="mt-1">
                          <span className="badge badge-light-danger fs-8">
                            ✗ Rechazado
                          </span>
                        </div>
                      )}
                      {contrato.estaSuspendido && (
                        <div className="mt-1">
                          <span className="badge badge-light-warning fs-8">
                            ⏸ Suspendido
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="text-end">
                      <Link className="btn btn-icon btn-bg-light btn-active-light-info" to='/contratos-ods/contrato-details' state={{ propsContratoId: contrato.id }}>
                        <KTIcon iconName="eye" className="fs-3" />
                      </Link>
                      <button className="btn btn-icon btn-bg-light btn-active-light-primary ms-3" onClick={() => fetchContrato(contrato.id)}>
                        <KTIcon iconName="pencil" className="fs-3" />
                      </button>
                      
                      {/* Botones de aprobación/rechazo - Solo para aprobadores */}
                      {esAprobador && (
                        <>
                          {!contrato.estaAprobado && (
                            <button 
                              className="btn btn-icon btn-bg-light btn-active-light-success ms-3" 
                              onClick={() => openApproveModal(contrato)}
                              title="Aprobar Contrato"
                            >
                              <KTIcon iconName="check" className="fs-3" />
                            </button>
                          )}
                          {!contrato.estaRechazado && !contrato.estaAprobado && (
                            <button 
                              className="btn btn-icon btn-bg-light btn-active-light-warning ms-3" 
                              onClick={() => openRejectModal(contrato)}
                              title="Rechazar Contrato"
                            >
                              <KTIcon iconName="cross" className="fs-3" />
                            </button>
                          )}
                        </>
                      )}

                      <button className="btn btn-icon btn-bg-light btn-active-light-danger ms-3" onClick={() => openDeleteModal(contrato.id)}>
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
          filteredItems={filteredContratos}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Modal Stepper de Creación/Edición de Contrato */}
        <ContratoStepperModal
          show={modalType === 'create' || modalType === 'edit'}
          handleClose={closeModal}
          onSubmit={(contrato) => {
            if (modalType === 'create') {
              createContrato(contrato);
            } else {
              updateContrato(contrato);
            }
          }}
          modalType={modalType === 'create' ? 'create' : 'edit'}
          initialData={modalType === 'edit' ? editedContrato : null}
          empresas={filtered_empresas}
          usuarios={usuarios}
        />

        {/* Caja de Confirmación de Eliminación de Contrato */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content={`¿Está seguro que desea eliminar el contrato ${contratos.find(c => c.id === deleteContratoId)?.numero
              }? Tenga en cuenta que esta acción eliminará todas las ODS, Talleres, Actas y Ampliaciones asociadas a este contrato.`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteContrato}
            closeModal={closeModal}
          />
        )}

        {/* Modal de Aprobación */}
        {modalType === 'approve' && (
          <ModalDialog
            title="Aprobar Contrato"
            content={`¿Estás seguro de que deseas aprobar el contrato "${editedContrato.numero}"?`}
            textBtn="Aprobar"
            confirmButtonClass="btn-success"
            onConfirm={approveContrato}
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
            onConfirm={rejectContrato}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}