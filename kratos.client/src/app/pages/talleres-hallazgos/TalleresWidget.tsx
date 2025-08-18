import { useState, useEffect } from "react"
import { Taller } from "../../interfaces/talleres-hallazgos/Taller"
import { TipoTaller } from "../../interfaces/talleres-hallazgos/TipoTaller"
import { Empresa } from "../../interfaces/seguridad/Empresa"
import { ODS } from "../../interfaces/contratos-ods/ODS"
import { HitoPago } from "../../interfaces/contratos-ods/HitoPago"
import tallerService from "../../services/talleres-hallazgos/tallerService"
import tipoTallerService from "../../services/talleres-hallazgos/tipoTallerService"
import empresaService from "../../services/seguridad/empresaService"
import odsService from "../../services/contratos-ods/odsService"
import hitoPagoService from "../../services/contratos-ods/hitoPagoService"
import PDFService from "../../services/talleres-hallazgos/PDFService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { TallerStepperModal } from "./TallerStepperModal"
import { Link } from "react-router-dom"
import { Pagination } from "../components/Pagination"
import { useAuth } from "../../modules/auth/AuthContext"

export function TalleresWidget({ selectedODSId, onUpdate }: { selectedODSId: number, onUpdate?: () => void }) {

  const { role } = useAuth();
  const currentRole = role || '';
  // const esOriginador = currentRole === 'Administrador' || currentRole === 'Funcionario Contratista';
  const esAprobador = currentRole === 'Administrador' || currentRole === 'Funcionario Cenit';

  const defaultTaller: Taller = {
    id: 0,
    nombre: 'T000',
    odsId: selectedODSId || 0, // Asegurar valor numérico
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
  const [talleres, setTalleres] = useState<Taller[]>([])
  const [editedTaller, setEditedTaller] = useState<Taller>(defaultTaller)
  const [deleteTallerId, setDeleteTallerId] = useState<number>(defaultTaller.id)

  const [tiposTaller, setTiposTaller] = useState<TipoTaller[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [ordenesServicio, setOrdenesServicio] = useState<ODS[]>([])
  const [hitosDePago, setHitosDePago] = useState<HitoPago[]>([])

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Modal de Creación/Edición/Eliminación/Aprobación/Rechazo
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | 'approve' | 'disapprove' | 'reject' | 'unreject' | null>(null)

  // Palabra a buscar en el listado de talleres
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)



  // Obtener todos los tipos de taller
  const fetchTiposTaller = () => {
    tipoTallerService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setTiposTaller(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los tipos de taller", error)
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

  // Obtener todas las ODS
  const fetchOrdenesServicio = () => {
    odsService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setOrdenesServicio(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las ODS", error)
      })
  }

  // Obtener todos los hitos de pago
  const fetchHitosDePago = () => {
    hitoPagoService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setHitosDePago(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los hitos de pago", error)
      })
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

  // Obtener todos los talleres cada vez que se renderiza el componente
  useEffect(() => {
    fetchTiposTaller()
    fetchEmpresas()
    fetchOrdenesServicio()
    fetchHitosDePago()
    fetchTalleres()
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
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url) // Liberar el objeto URL
      })
      .catch((error) => {
        console.error("Hubo un error al descargar el PDF", error)
      }
      )
  }

  // Obtener un solo taller (para editar)
  const fetchTaller = (id: number) => {
    tallerService.get(id)
      .then((response) => {
        setEditedTaller(response.data)
        setModalType('edit')
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el taller", error)
      })
  }

  // Crear un taller
  const createTaller = (data: Taller) => {
    // Asegurar odsId si viene de prop
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    tallerService.create(dataToSend)
      .then(() => {
        setEditedTaller(defaultTaller)
        alert("Taller creado exitosamente")
        closeModal()
        fetchTalleres()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al crear el taller", error)
        alert(`Error al crear taller: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar un taller
  const updateTaller = (data: Taller) => {
    // Asegurar odsId
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    tallerService.update(dataToSend)
      .then(() => {
        setEditedTaller(defaultTaller)
        alert("Taller actualizado exitosamente")
        closeModal()
        fetchTalleres()
        if (onUpdate) onUpdate();
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
        closeModal()
        fetchTalleres()
        if (onUpdate) onUpdate();
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

  // Funciones para aprobar/rechazar talleres desde la tabla
  const openApproveModal = (taller: Taller) => {
    setEditedTaller(taller)
    setModalType('approve')
  }

  const openRejectModal = (taller: Taller) => {
    setEditedTaller(taller)
    setModalType('reject')
  }

  const approveTaller = () => {
    const updatedTaller = { ...editedTaller, estaAprobado: true, estaRechazado: false }
    tallerService.update(updatedTaller)
      .then(() => {
        alert("Taller aprobado exitosamente")
        closeModal()
        fetchTalleres()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Error al aprobar taller", error)
        alert(`Error al aprobar taller: ${error.response?.data || error.message}`)
      })
  }

  const rejectTaller = () => {
    if (!editedTaller.comentarioAprobacion?.trim()) {
      alert("El comentario de rechazo es obligatorio")
      return
    }
    const updatedTaller = { ...editedTaller, estaRechazado: true, estaAprobado: false }
    tallerService.update(updatedTaller)
      .then(() => {
        alert("Taller rechazado exitosamente")
        closeModal()
        fetchTalleres()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Error al rechazar taller", error)
        alert(`Error al rechazar taller: ${error.response?.data || error.message}`)
      })
  }
  // Calcular el avance total de un taller
  const calcularAvanceTotal = (taller: Taller) => {
  const valores = [
    taller.avanceTipo1,
    taller.avanceTipo2,
    taller.avanceTipo3,
  ].filter(v => v > 0);

  if (valores.length === 0) return 0;
  const suma = valores.reduce((acc, v) => acc + v, 0);
  return Math.round(suma / valores.length);
};

  // Filtrar talleres por el Id de la ODS seleccionada
  const filteredTalleresByODS = selectedODSId !== 0 ? talleres.filter(taller => taller.odsId === selectedODSId) : talleres

  // Filtrar talleres por la palabra a buscar
  const filteredTalleres = filteredTalleresByODS.filter(taller => {
    const fecha = new Date(taller.fecha).toLocaleDateString().toLowerCase()
    return (
      taller.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordenesServicio.find(ods => ods.id === taller.odsId)?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talleres.find(taller => taller.odsId === selectedODSId)?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tiposTaller.find(tipo => tipo.id === taller.tipoId)?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fecha.includes(searchTerm) ||
      empresas.find(empresa => empresa.id === taller.consultorId)?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taller.proyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (`${taller.avanceTipo1 + taller.avanceTipo2 + taller.avanceTipo3}%`).includes(searchTerm) ||
      (taller.avanceTipo1 + taller.avanceTipo2 + taller.avanceTipo3 >= 100 ? 'Cerrado' : 'Abierto').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (taller.estaAprobado && 'aprobado'.includes(searchTerm.toLowerCase())) ||
      (taller.estaCancelado && 'cancelado'.includes(searchTerm.toLowerCase())) ||
      (taller.estaRechazado && 'rechazado'.includes(searchTerm.toLowerCase()))
    )
  })

  // Aplicar paginación a los datos
  const applyPagination = (data: Taller[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a los talleres filtrados
  const shownTalleres = applyPagination(filteredTalleres)



  return (
    <>
      {/* Listado de Talleres */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Talleres
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
              // Resetear estado asegurando odsId
              setEditedTaller({ ...defaultTaller, odsId: selectedODSId || 0 });
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
                  <th className='min-w-100px'>Hito de Pago</th>
                  <th className='min-w-150px'>Tipo de Taller</th>
                  <th className='min-w-150px'>Fecha</th>
                  <th className='min-w-150px'>Consultor</th>
                  <th className='min-w-150px'>Proyecto / Iniciativa</th>
                  <th className='min-w-150px'>Avance total</th>
                  <th className='min-w-150px text-center'>Estado</th>
                  <th className='min-w-250px text-end rounded-end pe-5'>Acciones</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {shownTalleres.map((taller) => (
                  <tr key={taller.id}>
                    <td>
                      <span className="d-block fw-bold fs-6 ps-5">
                        {taller.nombre}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-light fs-7">
                        {hitosDePago.find(hito => hito.id === taller.hitoPagoId)?.numero}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-light-primary fs-7">
                        {tiposTaller.find(tipo => tipo.id === taller.tipoId)?.nombre}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-light fs-7" style={{ width: 'fit-content' }}>
                        {new Date(taller.fecha).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span className="d-block fs-7 mb-1">
                        {empresas.find(empresa => empresa.id === taller.consultorId)?.nombre}
                      </span>
                    </td>
                    <td>
                      <span className="d-block fs-7 mb-1">
                        {taller.proyecto}
                      </span>
                    </td>
                    <td className="text-center">
                        {calcularAvanceTotal(taller)}%
                        <div className="progress" style={{ height: '5px' }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: `${calcularAvanceTotal(taller)}%` }}
                            aria-valuenow={calcularAvanceTotal(taller)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          ></div>
                        </div>
                      </td>
                    <td className="text-center">
                      <span className={`badge badge-light${taller.estado == 0 ? '-warning' :
                          taller.estado == 1 ? '-info' :
                            taller.estado == 2 ? '-success' :
                              taller.estado == 3 ? '-danger' :
                                ''} fs-7`}>
                        {taller.estado == 0 ? 'Pendiente' :
                          taller.estado == 1 ? 'En Proceso' :
                            taller.estado == 2 ? 'Completado' :
                              taller.estado == 3 ? 'Cancelado' :
                                taller.estado == 4 ? 'Rechazado' :
                                  taller.estado == 5 ? 'Falta Firma' :
                                    'Desconocido'}
                      </span>
                      
                      {/* Badges adicionales para aprobación/rechazo */}
                      {taller.estaAprobado && (
                        <div className="mt-1">
                          <span className="badge badge-light-success fs-8">
                            ✓ Aprobado
                          </span>
                        </div>
                      )}
                      {taller.estaRechazado && (
                        <div className="mt-1">
                          <span className="badge badge-light-danger fs-8">
                            ✗ Rechazado
                          </span>
                        </div>
                      )}
                      {taller.estaCancelado && (
                        <div className="mt-1">
                          <span className="badge badge-light-warning fs-8">
                            ⏸ Cancelado
                          </span>
                        </div>
                      )}
                      {taller.estaFirmado && (
                        <div className="mt-1">
                          <span className="badge badge-light-info fs-8">
                            ✓ Firmado
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="text-end pe-5">
                      <Link className="btn btn-icon btn-bg-light btn-active-light-info me-2" to="/talleres-hallazgos/taller-details" state={{ propsTallerId: taller.id }}>
                        <KTIcon iconName="eye" className="fs-3" />
                      </Link>
                      <button className="btn btn-icon btn-bg-light btn-active-light-secondary me-2" onClick={() => downloadPDF(taller.id)}>
                        <KTIcon iconName="share" className="fs-3" />
                      </button>
                      <button className="btn btn-icon btn-bg-light btn-active-light-primary me-2" onClick={() => fetchTaller(taller.id)}>
                        <KTIcon iconName="pencil" className="fs-3" />
                      </button>
                      
                      {/* Botones de aprobación/rechazo - Solo para aprobadores */}
                      {esAprobador && (
                        <>
                          {!taller.estaAprobado && (
                            <button 
                              className="btn btn-icon btn-bg-light btn-active-light-success me-2" 
                              onClick={() => openApproveModal(taller)}
                              title="Aprobar Taller"
                            >
                              <KTIcon iconName="check" className="fs-3" />
                            </button>
                          )}
                          {!taller.estaRechazado && !taller.estaAprobado && (
                            <button 
                              className="btn btn-icon btn-bg-light btn-active-light-warning me-2" 
                              onClick={() => openRejectModal(taller)}
                              title="Rechazar Taller"
                            >
                              <KTIcon iconName="cross" className="fs-3" />
                            </button>
                          )}
                        </>
                      )}

                      <button className="btn btn-icon btn-bg-light btn-active-light-danger" onClick={() => openDeleteModal(taller.id)}>
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
          filteredItems={filteredTalleres}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Modal Stepper de Creación/Edición de Taller */}
        <TallerStepperModal
          show={modalType === 'create' || modalType === 'edit'}
          handleClose={closeModal}
          onSubmit={(taller) => {
            if (modalType === 'create') {
              createTaller(taller);
            } else {
              updateTaller(taller);
            }
          }}
          modalType={modalType === 'create' ? 'create' : 'edit'}
          initialData={modalType === 'edit' ? editedTaller : null}
          selectedODSId={selectedODSId}
          ordenesServicio={ordenesServicio}
          tiposTaller={tiposTaller}
          empresas={empresas}
          hitosDePago={hitosDePago}
        />

        {/* Caja de Confirmación de Eliminación de Taller */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Eliminar Taller"
            content={`¿Estás seguro de que deseas eliminar el taller "${talleres.find(t => t.id === deleteTallerId)?.nombre
              }"? Esta acción eliminará las Acciones de Cierre y los Hallazgos asociados a este taller.`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteTaller}
            closeModal={closeModal}
          />
        )}

        {/* Modal de Aprobación */}
        {modalType === 'approve' && (
          <ModalDialog
            title="Aprobar Taller"
            content={`¿Estás seguro de que deseas aprobar el taller "${editedTaller.nombre}"?`}
            textBtn="Aprobar"
            confirmButtonClass="btn-success"
            onConfirm={approveTaller}
            closeModal={closeModal}
          />
        )}

        {/* Modal de Rechazo */}
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
            onConfirm={rejectTaller}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}