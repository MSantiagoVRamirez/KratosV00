import { useState, useEffect } from "react"
import { Hallazgo } from "../../interfaces/talleres-hallazgos/Hallazgo"
import { Taller } from "../../interfaces/talleres-hallazgos/Taller"
import { Disciplina } from "../../interfaces/talleres-hallazgos/Disciplina"
import { Usuario } from "../../interfaces/seguridad/Usuario"
import { ODS } from "../../interfaces/contratos-ods/ODS"
import hallazgoService from "../../services/talleres-hallazgos/hallazgoService"
import tallerService from "../../services/talleres-hallazgos/tallerService"
import disciplinaService from "../../services/talleres-hallazgos/disciplinaService"
import usuarioService from "../../services/seguridad/usuarioService"
import odsService from "../../services/contratos-ods/odsService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Link } from "react-router-dom"
import { Pagination } from "../components/Pagination"
import { useAuth } from "../../modules/auth/AuthContext"
import { HallazgoStepperModal } from "./HallazgoStepperModal"

export function HallazgosWidget({ selectedTallerId, onUpdate }: { selectedTallerId: number, onUpdate?: () => void }) {

  const { user, role } = useAuth()
  const currentUsername = user || ''
  const currentRole = role || ''
  // const esOriginador = currentRole === 'Administrador' || currentRole === 'Funcionario Contratista';
  const esAprobador = currentRole === 'Administrador' || currentRole === 'Funcionario Cenit';

  const [hallazgos, setHallazgos] = useState<Hallazgo[]>([])
  const [editedHallazgo, setEditedHallazgo] = useState<Hallazgo | undefined>(undefined)
  const [deleteHallazgoId, setDeleteHallazgoId] = useState<number>(0)

  const [talleres, setTalleres] = useState<Taller[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [ordenesServicio, setOrdenesServicio] = useState<ODS[]>([])

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Modal de Creación/Edición/Eliminación/Aprobación/Rechazo
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | 'approve' | 'disapprove' | 'reject' | 'unreject' | null>(null)

  // Palabra a buscar en el listado de hallazgos
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => {
    setModalType(null)
    setEditedHallazgo(undefined)
  }

  // Obtener todos los talleres
  const fetchTalleres = () => {
    tallerService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setTalleres(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los talleres", error)
      })
  }

  // Obtener todas las disciplinas
  const fetchDisciplinas = () => {
    disciplinaService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setDisciplinas(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las disciplinas", error)
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

  // Obtener todas los ODS
  const fetchOrdenesServicio = () => {
    odsService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setOrdenesServicio(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los ODS", error)
      })
  }

  // Obtener todos los hallazgos
  const fetchHallazgos = () => {
    hallazgoService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setHallazgos(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los hallazgos", error)
      })
  }

  // Obtener todos los hallazgos cada vez que se renderiza el componente
  useEffect(() => {
    fetchTalleres()
    fetchDisciplinas()
    fetchUsuarios()
    fetchOrdenesServicio()
    fetchHallazgos()
  }, [])



  // Obtener un solo hallazgo (para editar)
  const fetchHallazgo = (id: number) => {
    hallazgoService.get(id)
      .then((response) => {
        setEditedHallazgo(response.data)
        setModalType('edit')
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el hallazgo", error)
      })
  }

  // Crear o actualizar un hallazgo
  const handleSubmitHallazgo = (data: Hallazgo) => {
    const dataToSend = { ...data, tallerId: data.tallerId || selectedTallerId }
    
    if (editedHallazgo?.id) {
      // Actualizar
      hallazgoService.update(dataToSend)
        .then(() => {
          alert("Hallazgo actualizado exitosamente")
          closeModal()
          fetchHallazgos()
          if (onUpdate) onUpdate()
        })
        .catch((error) => {
          console.error("Hubo un error al actualizar el hallazgo", error)
          alert(`Error al actualizar hallazgo: ${error.response?.data || error.response?.data?.message || error.message}`);
        })
    } else {
      // Crear
      hallazgoService.create(dataToSend)
        .then(() => {
          alert("Hallazgo creado exitosamente")
          closeModal()
          fetchHallazgos()
          if (onUpdate) onUpdate()
        })
        .catch((error) => {
          console.error("Hubo un error al crear el hallazgo", error)
          alert(`Error al crear hallazgo: ${error.response?.data || error.response?.data?.message || error.message}`);
        })
    }
  }

  // Eliminar un hallazgo
  const deleteHallazgo = () => {
    hallazgoService.remove(deleteHallazgoId)
      .then(() => {
        setDeleteHallazgoId(0)
        alert("Hallazgo eliminado exitosamente")
        closeModal()
        fetchHallazgos()
        if (onUpdate) onUpdate()
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

  // Funciones para aprobar/rechazar hallazgos desde la tabla
  const openApproveModal = (hallazgo: Hallazgo) => {
    setEditedHallazgo(hallazgo)
    setModalType('approve')
  }

  const openRejectModal = (hallazgo: Hallazgo) => {
    setEditedHallazgo(hallazgo)
    setModalType('reject')
  }

  const approveHallazgo = () => {
    if (!editedHallazgo || !editedHallazgo.id) {
      alert("Error: Hallazgo no seleccionado")
      return
    }
    const updatedHallazgo = { ...editedHallazgo, estaAprobado: true, estaRechazado: false }
    hallazgoService.update(updatedHallazgo)
      .then(() => {
        alert("Hallazgo aprobado exitosamente")
        closeModal()
        fetchHallazgos()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Error al aprobar hallazgo", error)
        alert(`Error al aprobar hallazgo: ${error.response?.data || error.message}`)
      })
  }

  const rejectHallazgo = () => {
    if (!editedHallazgo || !editedHallazgo.id) {
      alert("Error: Hallazgo no seleccionado")
      return
    }
    if (!editedHallazgo.comentarioAprobacion?.trim()) {
      alert("El comentario de rechazo es obligatorio")
      return
    }
    const updatedHallazgo = { ...editedHallazgo, estaRechazado: true, estaAprobado: false }
    hallazgoService.update(updatedHallazgo)
      .then(() => {
        alert("Hallazgo rechazado exitosamente")
        closeModal()
        fetchHallazgos()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Error al rechazar hallazgo", error)
        alert(`Error al rechazar hallazgo: ${error.response?.data || error.message}`)
      })
  }

  // Filtrar hallazgos por Id del taller seleccionado
  const filteredHallazgosByTaller = selectedTallerId !== 0 ? hallazgos.filter(hallazgo => hallazgo.tallerId === selectedTallerId) : hallazgos

  // Filtrar hallazgos por la palabra a buscar
  const filteredHallazgos = filteredHallazgosByTaller.filter(hallazgo => {
    const fechaCierrePlaneada = new Date(hallazgo.fechaCierrePlaneada).toLocaleDateString().toLowerCase()
    const fechaCierreReal = hallazgo.fechaCierreReal ? new Date(hallazgo.fechaCierreReal).toLocaleDateString().toLowerCase() : ''
    const diasRetraso = `${hallazgo.fechaCierreReal
      ? Math.round(Math.abs(new Date(hallazgo.fechaCierrePlaneada).getTime() - new Date(hallazgo.fechaCierreReal).getTime()) / (1000 * 3600 * 24))
      : Math.round(Math.abs(new Date(hallazgo.fechaCierrePlaneada).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} días`
    const estadoTexto = hallazgo.estado === 0 ? 'Por Iniciar' : hallazgo.estado === 1 ? 'En Proceso' : hallazgo.estado === 2 ? 'En Verificación' : hallazgo.estado === 3 ? 'Cerrado' : 'Desconocido';

    return (
      hallazgo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hallazgo.recomendacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talleres.find(taller => taller.id === hallazgo.tallerId)?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordenesServicio.find(ods => ods.id === talleres.find(taller => taller.id === hallazgo.tallerId)?.odsId)?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disciplinas.find(disciplina => disciplina.id === hallazgo.disciplinaId)?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hallazgo.tipoCategoria == 0 ? 'Tipo 1' : hallazgo.tipoCategoria == 1 ? 'Tipo 2' : 'Tipo 3').toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuarios.find(usuario => usuario.id === hallazgo.responsableAccionId)?.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuarios.find(usuario => usuario.id === hallazgo.responsableAccionId)?.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuarios.find(usuario => usuario.id === hallazgo.originadorBrechasId)?.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuarios.find(usuario => usuario.id === hallazgo.originadorBrechasId)?.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fechaCierrePlaneada.includes(searchTerm) ||
      fechaCierreReal.includes(searchTerm) ||
      diasRetraso.toString().includes(searchTerm) ||
      estadoTexto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hallazgo.estaAprobado ? 'aprobado' : '').includes(searchTerm.toLowerCase()) ||
      (hallazgo.estaCancelado ? 'cancelado' : '').includes(searchTerm.toLowerCase()) ||
      (hallazgo.estaRechazado ? 'rechazado' : '').includes(searchTerm.toLowerCase()) ||
      (hallazgo.estaFirmado ? 'firmado' : '').includes(searchTerm.toLowerCase())
    )
  })

  // Aplicar paginación a los datos
  const applyPagination = (data: Hallazgo[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a los hallazgos filtrados
  const shownHallazgos = applyPagination(filteredHallazgos)

  return (
    <>
      {/* Listado de Hallazgos */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Hallazgos
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
              setEditedHallazgo(undefined);
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
                  <th className='min-w-150px'>Disciplina</th>
                  <th className='min-w-100px'>Categoría</th>
                  <th className='min-w-150px'>Responsables Acción / Originador</th>
                  <th className='min-w-150px'>Fechas de Cierre Planeada / Real</th>
                  <th className='min-w-100px'>Días de Retraso</th>
                  <th className='min-w-100px text-center'>Estado</th>
                  <th className='min-w-250px text-end rounded-end pe-5'>Acciones</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {shownHallazgos.map((hallazgo) => (
                  <tr key={hallazgo.id}>
                    <td>
                      <span className="d-block fw-bold fs-6 ps-5">
                        {hallazgo.nombre}
                      </span>
                    </td>
                    <td>
                      <span className="d-block fs-7">
                        {disciplinas.find(disciplina => disciplina.id === hallazgo.disciplinaId)?.nombre}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-light-primary fs-7 mb-1">
                        {hallazgo.tipoCategoria == 0 ? 'Tipo 1' : hallazgo.tipoCategoria == 1 ? 'Tipo 2' : 'Tipo 3'}
                      </span>
                    </td>
                    <td>
                      <span className="d-block fs-7 mb-1">
                        {usuarios.find(usuario => usuario.id === hallazgo.responsableAccionId)?.nombres}{' '}
                        {usuarios.find(usuario => usuario.id === hallazgo.responsableAccionId)?.apellidos}
                      </span>
                      <span className="d-block text-muted fs-7">
                        {usuarios.find(usuario => usuario.id === hallazgo.originadorBrechasId)?.nombres}{' '}
                        {usuarios.find(usuario => usuario.id === hallazgo.originadorBrechasId)?.apellidos}
                      </span>
                    </td>
                    <td>
                      <span className="d-block text-danger fs-7 mb-1">
                        {new Date(hallazgo.fechaCierrePlaneada).toLocaleDateString()}
                      </span>
                      <span className="d-block text-muted fs-7">
                        {hallazgo.fechaCierreReal ? new Date(hallazgo.fechaCierreReal).toLocaleDateString() : 'Sin fecha'}
                      </span>
                    </td>
                    <td>
                      <span className={`d-block fs-6 mb-1 ${(hallazgo.fechaCierreReal
                        ? Math.round(Math.abs(new Date(hallazgo.fechaCierrePlaneada).getTime() - new Date(hallazgo.fechaCierreReal).getTime()) / (1000 * 3600 * 24))
                        : Math.round(Math.abs(new Date(hallazgo.fechaCierrePlaneada).getTime() - new Date().getTime()) / (1000 * 3600 * 24))) > 0 ? 'text-danger' : 'text-sucess'}`} style={{ width: 'fit-content' }}>
                        {hallazgo.fechaCierreReal
                          ? Math.round(Math.abs(new Date(hallazgo.fechaCierrePlaneada).getTime() - new Date(hallazgo.fechaCierreReal).getTime()) / (1000 * 3600 * 24))
                          : Math.round(Math.abs(new Date(hallazgo.fechaCierrePlaneada).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} días
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge fs-7 mb-1 badge-light${hallazgo.estado === 0 ? '-warning' :
                          hallazgo.estado === 1 ? '-info' :
                            hallazgo.estado === 2 ? '-success' :
                              hallazgo.estado === 3 ? '-info' :
                                hallazgo.estado === 4 ? '-danger' :
                                  hallazgo.estado === 5 ? '-danger' :
                                    hallazgo.estado === 6 ? '-danger' :
                                      ''}`} style={{ width: 'fit-content' }}>
                        {hallazgo.estado === 0 ? 'Pendiente' :
                          hallazgo.estado === 1 ? 'En Proceso' :
                            hallazgo.estado === 2 ? 'Completado' :
                              hallazgo.estado === 3 ? 'En Verificación' :
                                hallazgo.estado === 4 ? 'Cancelado' :
                                  hallazgo.estado === 5 ? 'Rechazado' :
                                    hallazgo.estado === 6 ? 'Falta Firma' :
                                      'Desconocido'}
                      </span>
                      
                      {/* Badges adicionales para aprobación/rechazo */}
                      {hallazgo.estaAprobado && (
                        <div className="mt-1">
                          <span className="badge badge-light-success fs-8">
                            ✓ Aprobado
                          </span>
                        </div>
                      )}
                      {hallazgo.estaRechazado && (
                        <div className="mt-1">
                          <span className="badge badge-light-danger fs-8">
                            ✗ Rechazado
                          </span>
                        </div>
                      )}
                      {hallazgo.estaCancelado && (
                        <div className="mt-1">
                          <span className="badge badge-light-warning fs-8">
                            ⏸ Cancelado
                          </span>
                        </div>
                      )}
                      {hallazgo.estaFirmado && (
                        <div className="mt-1">
                          <span className="badge badge-light-info fs-8">
                            ✓ Firmado
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="text-end pe-5">
                      <Link className="btn btn-icon btn-bg-light btn-active-light-info me-2" to="/talleres-hallazgos/hallazgo-details" state={{ propsHallazgoId: hallazgo.id }}>
                        <KTIcon iconName="eye" className="fs-3" />
                      </Link>
                      <button className="btn btn-icon btn-bg-light btn-active-light-primary me-2" onClick={() => fetchHallazgo(hallazgo.id)}>
                        <KTIcon iconName="pencil" className="fs-3" />
                      </button>
                      
                      {/* Botones de aprobación/rechazo - Solo para aprobadores */}
                      {esAprobador && (
                        <>
                          {!hallazgo.estaAprobado && (
                            <button 
                              className="btn btn-icon btn-bg-light btn-active-light-success me-2" 
                              onClick={() => openApproveModal(hallazgo)}
                              title="Aprobar Hallazgo"
                            >
                              <KTIcon iconName="check" className="fs-3" />
                            </button>
                          )}
                          {!hallazgo.estaRechazado && !hallazgo.estaAprobado && (
                            <button 
                              className="btn btn-icon btn-bg-light btn-active-light-warning me-2" 
                              onClick={() => openRejectModal(hallazgo)}
                              title="Rechazar Hallazgo"
                            >
                              <KTIcon iconName="cross" className="fs-3" />
                            </button>
                          )}
                        </>
                      )}

                      <button className="btn btn-icon btn-bg-light btn-active-light-danger" onClick={() => openDeleteModal(hallazgo.id)}>
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
          filteredItems={filteredHallazgos}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Modal Stepper de Hallazgo */}
        <HallazgoStepperModal
          show={modalType === 'create' || modalType === 'edit'}
          handleClose={closeModal}
          onSubmit={handleSubmitHallazgo}
          hallazgo={editedHallazgo}
          selectedTallerId={selectedTallerId}
          talleres={talleres}
          disciplinas={disciplinas}
          usuarios={usuarios}
          currentUsername={currentUsername}
        />

        {/* Caja de Confirmación de Eliminación de Hallazgo */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Eliminar Hallazgo"
            content={`¿Estás seguro de que deseas eliminar el hallazgo "${hallazgos.find(h => h.id === deleteHallazgoId)?.nombre
              }"? Esta acción eliminará las Acciones de Cierre asociadas a este hallazgo.`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteHallazgo}
            closeModal={closeModal}
          />
        )}

        {/* Modal de Aprobación */}
        {modalType === 'approve' && editedHallazgo && (
          <ModalDialog
            title="Aprobar Hallazgo"
            content={`¿Estás seguro de que deseas aprobar el hallazgo "${editedHallazgo.nombre}"?`}
            textBtn="Aprobar"
            confirmButtonClass="btn-success"
            onConfirm={approveHallazgo}
            closeModal={closeModal}
          />
        )}

        {/* Modal de Rechazo */}
        {modalType === 'reject' && editedHallazgo && (
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
                    onChange={(e) => setEditedHallazgo(prev => prev ? ({ ...prev, comentarioAprobacion: e.target.value }) : prev)}
                    className="form-control"
                    rows={3}
                    required
                  />
                </div>
              </div>
            }
            textBtn="Rechazar"
            confirmButtonClass="btn-warning"
            onConfirm={rejectHallazgo}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}