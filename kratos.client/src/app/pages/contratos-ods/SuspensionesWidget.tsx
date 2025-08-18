import { useState, useEffect } from "react"
import { Suspension } from "../../interfaces/contratos-ods/Suspension"
import suspensionService from "../../services/contratos-ods/suspensionService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation';

export function SuspensionesWidget({ selectedOdsId, onUpdate }: { selectedOdsId: number, onUpdate?: () => void }) {
  const defaultSuspension: Suspension = {
    id: 0,
    odsId: selectedOdsId,
    fechaInicioSuspension: '',
    fechaFinSuspension: ''
  }

  const [suspensiones, setSuspensiones] = useState<Suspension[]>([])
  const [editedSuspension, setEditedSuspension] = useState<Suspension>(defaultSuspension)
  const [deleteSuspensionId, setDeleteSuspensionId] = useState<number>(0)

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)

  // Palabra a buscar (por fecha)
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Función para calcular la duración en días
  const calcularDuracionEnDias = (fechaInicio: string, fechaFin: string): number => {
    if (!fechaInicio || !fechaFin) return 0;
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return 0;
    
    const diferenciaTiempo = fin.getTime() - inicio.getTime();
    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
    
    return diferenciaDias > 0 ? diferenciaDias : 0;
  }

  // Cerrar el Modal
  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    odsId: { value: editedSuspension.odsId, required: true, type: 'number' },
    fechaInicioSuspension: { value: editedSuspension.fechaInicioSuspension, required: true, type: 'date' },
    fechaFinSuspension: { value: editedSuspension.fechaFinSuspension, required: true, type: 'date' },
  });

  // Obtener todas las suspensiones
  const fetchSuspensiones = () => {
    suspensionService.getAll()
      .then((response) => {
        // Siempre actualizar el estado, incluso si el array está vacío
        setSuspensiones(response.data || [])
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las suspensiones", error)
        // En caso de error, mantener el estado actual o limpiarlo
        setSuspensiones([])
      })
  }

  useEffect(() => {
    fetchSuspensiones()
  }, [selectedOdsId])

  // Obtener una sola suspensión (para editar)
  const fetchSuspension = (id: number) => {
    suspensionService.get(id)
      .then((response) => {
        setEditedSuspension(response.data)
        setModalType('edit')
      })
      .catch((error) => {
        console.error("Hubo un error al obtener la suspensión", error)
      })
  }

  // Crear una suspensión
  const createSuspension = (data: Suspension) => {
    suspensionService.create({ ...data, odsId: data.odsId || selectedOdsId })
      .then(() => {
        setEditedSuspension(defaultSuspension)
        alert("Suspensión creada exitosamente")
        closeModal()
        fetchSuspensiones()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al crear la suspensión", error)
        alert(`Error al crear suspensión: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar una suspensión
  const updateSuspension = (data: Suspension) => {
    suspensionService.update({ ...data, odsId: data.odsId || selectedOdsId })
      .then(() => {
        setEditedSuspension(defaultSuspension)
        alert("Suspensión actualizada exitosamente")
        closeModal()
        fetchSuspensiones()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar la suspensión", error)
        alert(`Error al actualizar suspensión: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar una suspensión
  const deleteSuspension = () => {
    suspensionService.remove(deleteSuspensionId)
      .then(() => {
        // Actualizar inmediatamente el estado local removiendo el elemento eliminado
        setSuspensiones(prevSuspensiones => 
          prevSuspensiones.filter(suspension => suspension.id !== deleteSuspensionId)
        )
        setDeleteSuspensionId(0)
        alert("Suspensión eliminada exitosamente")
        closeModal()
        // También hacer fetch para asegurar sincronización con el servidor
        fetchSuspensiones()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar la suspensión", error)
        alert(`Error al eliminar suspensión: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteSuspensionId(id)
    setModalType('delete')
  }

  // Filtrar las suspensiones por odsId
  const filteredSuspensiones = suspensiones.filter(s => s.odsId === selectedOdsId)

  // Filtrar por búsqueda (fecha inicio o fin)
  const filteredSuspensionesSearch = filteredSuspensiones.filter(s =>
    s.fechaInicioSuspension.includes(searchTerm) ||
    s.fechaFinSuspension.includes(searchTerm)
  )

  // Paginación
  const applyPagination = (data: Suspension[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return data.slice(startIndex, startIndex + itemsPerPage)
  }
  const shownSuspensiones = applyPagination(filteredSuspensionesSearch)

  return (
    <>
      <div className="card mx-10 my-10 mx-0-sm">
        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Suspensiones
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
              placeholder="Buscar por fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-sm btn-light-primary btn-active-primary d-flex" onClick={() => {
              setEditedSuspension({ ...defaultSuspension, odsId: selectedOdsId });
              setModalType('create');
            }}>
              <KTIcon iconName="plus" className="fs-3" /> Agregar
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="card-body pb-0">
          <div className="table-responsive">
            <table className="table align-middle gs-0 gy-3">
              <thead>
                <tr className='fw-semibold text-muted bg-light fs-6'>
                  <th className='min-w-150px rounded-start ps-5'>Fecha Inicio</th>
                  <th className='min-w-150px'>Fecha Fin</th>
                  <th className='min-w-100px'>Duración</th>
                  <th className='min-w-150px text-end rounded-end pe-5'>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shownSuspensiones.map((suspension) => (
                  <tr key={suspension.id}>
                    <td>
                      <span className="d-block fs-6 ps-5">
                        {new Date(suspension.fechaInicioSuspension).toLocaleDateString('es-CO')}
                      </span>
                    </td>
                    <td>
                      <span className="d-block fs-6">
                        {new Date(suspension.fechaFinSuspension).toLocaleDateString('es-CO')}
                      </span>
                    </td>
                    <td>
                      <span className="d-block fs-6 fw-bold text-primary">
                        {calcularDuracionEnDias(suspension.fechaInicioSuspension, suspension.fechaFinSuspension)} días
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchSuspension(suspension.id)}>
                        <KTIcon iconName="pencil" className="fs-3" />
                      </button>
                      <button className="btn btn-icon btn-bg-light btn-active-light-danger ms-3" onClick={() => openDeleteModal(suspension.id)}>
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
          filteredItems={filteredSuspensionesSearch}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Suspensión */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Suspensión" : "Editar Suspensión"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                <div className="form-group">
                  <label className="form-label required"> Fecha de Inicio </label>
                  <input
                    type="date"
                    value={editedSuspension.fechaInicioSuspension ? new Date(editedSuspension.fechaInicioSuspension).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditedSuspension(prev => ({ ...prev, fechaInicioSuspension: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required"> Fecha de Fin </label>
                  <input
                    type="date"
                    value={editedSuspension.fechaFinSuspension ? new Date(editedSuspension.fechaFinSuspension).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditedSuspension(prev => ({ ...prev, fechaFinSuspension: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"> Duración (días) </label>
                  <input
                    type="number"
                    value={calcularDuracionEnDias(editedSuspension.fechaInicioSuspension, editedSuspension.fechaFinSuspension)}
                    className="form-control bg-light"
                    disabled
                    readOnly
                  />
                  <div className="form-text text-muted">
                    Este campo se calcula automáticamente basado en las fechas seleccionadas
                  </div>
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createSuspension(editedSuspension);
              } else {
                updateSuspension(editedSuspension);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Caja de Confirmación de Eliminación */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content="¿Está seguro que desea eliminar esta suspensión?"
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteSuspension}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}
