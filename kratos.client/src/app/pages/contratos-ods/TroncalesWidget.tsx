import { useState, useEffect } from "react"
import { Troncal } from "../../interfaces/contratos-ods/Troncal"
import troncalService from "../../services/contratos-ods/troncalService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation'

export function TroncalesWidget() {

  const defaultTroncal: Troncal = {
    id: 0,
    nombre: ""
  }
  const [troncales, setTroncales] = useState<Troncal[]>([])
  const [editedTroncal, setEditedTroncal] = useState<Troncal>(defaultTroncal)
  const [deleteTroncalId, setDeleteTroncalId] = useState<number>(defaultTroncal.id)

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(24)

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [showContent, setShowContent] = useState(true)

  // Palabra a buscar dentro de las troncales
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    nombre: { value: editedTroncal.nombre, required: true, type: 'string' }
  });

  // Obtener todas las troncales
  const fetchTroncales = () => {
    troncalService.getAll()
      .then((response) => {
        typeof (response.data) === 'string' ? setShowContent(false) : setTroncales(response.data)  // Llenar la lista de troncales
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las troncales", error)
      })
  }

  // Obtener todas las troncales cada vez que se renderiza el componente
  useEffect(() => {
    fetchTroncales()
  }, [])

  // Obtener una sola troncal (para editar)
  const fetchTroncal = (id: number) => {
    troncalService.get(id)
      .then((response) => {
        setEditedTroncal(response.data)  // Llenar el estado unificado
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener la troncal", error)
      })
  }

  // Crear una troncal
  const createTroncal = (data: Troncal) => {
    troncalService.create(data)
      .then(() => {
        setEditedTroncal(defaultTroncal) // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchTroncales()  // Actualizar la lista de troncales
      })
      .catch((error) => {
        console.error("Hubo un error al crear la zona", error)
        alert(`Error al crear zona: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar una troncal
  const updateTroncal = (data: Troncal) => {
    troncalService.update(data)
      .then(() => {
        setEditedTroncal(defaultTroncal) // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchTroncales()  // Actualizar la lista de troncales
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar la zona", error)
        alert(`Error al actualizar zona: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar una troncal
  const deleteTroncal = () => {
    troncalService.remove(deleteTroncalId)
      .then(() => {
        setDeleteTroncalId(defaultTroncal.id) // Limpiar el input de eliminación
        closeModal()  // Ocultar el formulario
        fetchTroncales()  // Actualizar la lista de troncales
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar la zona", error)
        alert(`Error al eliminar zona: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteTroncalId(id)
    setModalType('delete')
  }

  // Filtrar las troncales por nombre
  const filteredTroncales = troncales.filter((troncal) =>
    troncal.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )
  // Aplicar paginación a los datos
  const applyPagination = (data: Troncal[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a las troncales filtradas
  const shownTroncales = applyPagination(filteredTroncales)

  // Estilo para el grid
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px',
    padding: '20px',
  }

  return (
    <>
      {/* Listado de Troncales */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Zonas
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
              setEditedTroncal(defaultTroncal);
              setModalType('create');
            }}>
              <KTIcon iconName="plus" className="fs-3" /> Agregar
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="card-body" style={gridStyle}>
          {!showContent ? (
            <span className="text-muted fs-4">No se encontraron registros.</span>
          ) : (searchTerm != "" && shownTroncales.length === 0) ? (
            <span className="text-muted fs-4">No se encontraron zonas.</span>
          ) : (
            shownTroncales.map((troncal) => (
              <div className="d-flex gap-2" key={troncal.id}>
                <div className="flex-grow-1 mx-3 d-flex align-items-center border border-1 border-gray-300 rounded p-3">
                  <span className="text-gray-800 fw-bold fs-6">
                    {troncal.nombre}
                  </span>
                </div>
                <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchTroncal(troncal.id)}>
                  <KTIcon iconName="pencil" className="fs-3" />
                </button>
                <button className="btn btn-icon btn-bg-light btn-active-light-danger" onClick={() => openDeleteModal(troncal.id)}>
                  <KTIcon iconName="trash" className="fs-3" />
                </button>
              </div>
            )))}
        </div>

        {/* Paginación */}
        <Pagination
          filteredItems={filteredTroncales}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Troncal (Zona) */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Zona" : "Editar Zona"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                <div className="form-group">
                  <label className="form-label required">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre de la zona"
                    value={editedTroncal.nombre}
                    onChange={(e) => setEditedTroncal(prev => ({ ...prev, nombre: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <span className="text-muted fs-7">
                  Asigne un nombre descriptivo a la zona. Este campo será visible en la lista de zonas del sistema.
                </span>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createTroncal(editedTroncal);
              } else {
                updateTroncal(editedTroncal);
              }
            }}
            closeModal={closeModal}
          />
        )}

      </div>

      {/* Confirmar Eliminación */}
      {modalType === 'delete' && (
        <ModalDialog
          title="Confirmar Eliminación"
          content={`¿Está seguro que desea eliminar la zona ${troncales.find(t => t.id === deleteTroncalId)?.nombre}?`}
          textBtn="Eliminar"
          confirmButtonClass="btn-danger"
          onConfirm={deleteTroncal}
          closeModal={closeModal}
        />
      )}
    </>
  )
}