import { useState, useEffect } from "react"
import { Planta } from "../../interfaces/contratos-ods/Planta"
import plantaService from "../../services/contratos-ods/plantaService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation'

export function PlantasWidget() {

  const defaultPlanta: Planta = {
    id: 0,
    nombre: ""
  }
  const [plantas, setPlantas] = useState<Planta[]>([])
  const [editedPlanta, setEditedPlanta] = useState<Planta>(defaultPlanta)
  const [deletePlantaId, setDeletePlantaId] = useState<number>(defaultPlanta.id)

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(24)

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [showContent, setShowContent] = useState(true)

  // Palabra a buscar dentro de las plantas
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    nombre: { value: editedPlanta.nombre, required: true, type: 'string' }
  });

  // Obtener todas las plantas
  const fetchPlantas = () => {
    plantaService.getAll() // Usar plantaService
      .then((response) => {
        typeof (response.data) === 'string' ? setShowContent(false) : setPlantas(response.data)  // Llenar la lista de plantas
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las plantas", error)
      })
  }

  // Obtener todas las plantas cada vez que se renderiza el componente
  useEffect(() => {
    fetchPlantas()
  }, [])

  // Obtener una sola planta (para editar)
  const fetchPlanta = (id: number) => {
    plantaService.get(id) // Usar plantaService
      .then((response) => {
        setEditedPlanta(response.data)  // Llenar el estado unificado
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener la planta", error)
      })
  }

  // Crear una planta
  const createPlanta = (data: Planta) => {
    plantaService.create(data) // Usar plantaService
      .then(() => {
        setEditedPlanta(defaultPlanta) // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchPlantas()  // Actualizar la lista de plantas
      })
      .catch((error) => {
        console.error("Hubo un error al crear la planta", error)
        alert(`Error al crear planta: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar una planta
  const updatePlanta = (data: Planta) => {
    plantaService.update(data) // Usar plantaService
      .then(() => {
        setEditedPlanta(defaultPlanta) // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchPlantas()  // Actualizar la lista de plantas
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar la planta", error)
        alert(`Error al actualizar planta: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar una planta
  const deletePlanta = () => {
    plantaService.remove(deletePlantaId) // Usar plantaService
      .then(() => {
        setDeletePlantaId(defaultPlanta.id) // Limpiar el input de eliminación
        closeModal()  // Ocultar el formulario
        fetchPlantas()  // Actualizar la lista de plantas
      })
      .catch((error) => {
        alert(`Error al eliminar planta: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeletePlantaId(id)
    setModalType('delete')
  }

  // Filtrar las plantas por nombre
  const filteredPlantas = plantas.filter((planta) =>
    planta.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )
  // Aplicar paginación a los datos
  const applyPagination = (data: Planta[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a las plantas filtradas
  const shownPlantas = applyPagination(filteredPlantas)

  // Estilo para el grid
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px',
    padding: '20px',
  }

  return (
    <>
      {/* Listado de Plantas */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Estaciones {/* Cambiado de Zonas a Plantas */}
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
              setEditedPlanta(defaultPlanta);
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
          ) : (searchTerm != "" && shownPlantas.length === 0) ? (
            <span className="text-muted fs-4">No se encontraron estaciones.</span>
          ) : (
            shownPlantas.map((planta) => (
              <div className="d-flex gap-2" key={planta.id}>
                <div className="flex-grow-1 mx-3 d-flex align-items-center border border-1 border-gray-300 rounded p-3">
                  <span className="text-gray-800 fw-bold fs-6">
                    {planta.nombre}
                  </span>
                </div>
                <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchPlanta(planta.id)}>
                  <KTIcon iconName="pencil" className="fs-3" />
                </button>
                <button className="btn btn-icon btn-bg-light btn-active-light-danger" onClick={() => openDeleteModal(planta.id)}>
                  <KTIcon iconName="trash" className="fs-3" />
                </button>
              </div>
            )))}
        </div>

        {/* Paginación */}
        <Pagination
          filteredItems={filteredPlantas}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Planta */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Estación" : "Editar Estación"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                <div className="form-group">
                  <label className="form-label required">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre de la estación" // Cambiado de zona a estación
                    value={editedPlanta.nombre}
                    onChange={(e) => setEditedPlanta(prev => ({ ...prev, nombre: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <span className="text-muted fs-7">
                  Asigne un nombre descriptivo a la estación. Este campo será visible en la lista de estaciones del sistema.
                </span>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createPlanta(editedPlanta);
              } else {
                updatePlanta(editedPlanta);
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
          content={`¿Está seguro que desea eliminar la estación ${plantas.find(p => p.id === deletePlantaId)?.nombre}?`}
          textBtn="Eliminar"
          confirmButtonClass="btn-danger"
          onConfirm={deletePlanta}
          closeModal={closeModal}
        />
      )}
    </>
  )
}
