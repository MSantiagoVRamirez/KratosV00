import { useState, useEffect } from "react"
import { Sistema } from "../../interfaces/contratos-ods/Sistema"
import sistemaService from "../../services/contratos-ods/sistemaService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation'

export function SistemasWidget() {

  const defaultSistema: Sistema = {
    id: 0,
    nombre: ""
  }
  const [sistemas, setSistemas] = useState<Sistema[]>([])
  const [editedSistema, setEditedSistema] = useState<Sistema>(defaultSistema)
  const [deleteSistemaId, setDeleteSistemaId] = useState<number>(defaultSistema.id)

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(24)

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [showContent, setShowContent] = useState(true)

  // Palabra a buscar dentro de los sistemas
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    nombre: { value: editedSistema.nombre, required: true, type: 'string' }
  });

  // Obtener todos los sistemas
  const fetchSistemas = () => {
    sistemaService.getAll()
      .then((response) => {
        typeof (response.data) === 'string' ? setShowContent(false) : setSistemas(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los sistemas", error)
      })
  }

  // Obtener todos los sistemas cada vez que se renderiza el componente
  useEffect(() => {
    fetchSistemas()
  }, [])

  // Obtener un solo sistema (para editar)
  const fetchSistema = (id: number) => {
    sistemaService.get(id)
      .then((response) => {
        setEditedSistema(response.data)
        setModalType('edit')
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el sistema", error)
      })
  }

  // Crear un sistema
  const createSistema = (data: Sistema) => {
    sistemaService.create(data)
      .then(() => {
        setEditedSistema(defaultSistema)
        closeModal()
        fetchSistemas()
      })
      .catch((error) => {
        console.error("Hubo un error al crear el sistema", error)
        alert(`Error al crear sistema: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar un sistema
  const updateSistema = (data: Sistema) => {
    sistemaService.update(data)
      .then(() => {
        setEditedSistema(defaultSistema)
        closeModal()
        fetchSistemas()
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el sistema", error)
        alert(`Error al actualizar sistema: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar un sistema
  const deleteSistema = () => {
    sistemaService.remove(deleteSistemaId)
      .then(() => {
        setDeleteSistemaId(defaultSistema.id)
        closeModal()
        fetchSistemas()
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el sistema", error)
        alert(`Error al eliminar sistema: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteSistemaId(id)
    setModalType('delete')
  }

  // Filtrar los sistemas por nombre
  const filteredSistemas = sistemas.filter((sistema) =>
    sistema.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )
  // Aplicar paginación a los datos
  const applyPagination = (data: Sistema[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a los sistemas filtrados
  const shownSistemas = applyPagination(filteredSistemas)

  // Estilo para el grid
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px',
    padding: '20px',
  }

  return (
    <>
      {/* Listado de Sistemas */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Sistemas
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
              setEditedSistema(defaultSistema);
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
          ) : (searchTerm != "" && shownSistemas.length === 0) ? (
            <span className="text-muted fs-4">No se encontraron sistemas.</span>
          ) : (
            shownSistemas.map((sistema) => (
              <div className="d-flex gap-2" key={sistema.id}>
                <div className="flex-grow-1 mx-3 d-flex align-items-center border border-1 border-gray-300 rounded p-3">
                  <span className="text-gray-800 fw-bold fs-6">
                    {sistema.nombre}
                  </span>
                </div>
                <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchSistema(sistema.id)}>
                  <KTIcon iconName="pencil" className="fs-3" />
                </button>
                <button className="btn btn-icon btn-bg-light btn-active-light-danger" onClick={() => openDeleteModal(sistema.id)}>
                  <KTIcon iconName="trash" className="fs-3" />
                </button>
              </div>
            )))}
        </div>

        {/* Paginación */}
        <Pagination
          filteredItems={filteredSistemas}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Sistema */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Sistema" : "Editar Sistema"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                <div className="form-group">
                  <label className="form-label required">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre del sistema"
                    value={editedSistema.nombre}
                    onChange={(e) => setEditedSistema(prev => ({ ...prev, nombre: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <span className="text-muted fs-7">
                  Asigne un nombre descriptivo al sistema. Este campo será visible en la lista de sistemas del sistema.
                </span>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createSistema(editedSistema);
              } else {
                updateSistema(editedSistema);
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
          content={`¿Está seguro que desea eliminar el sistema ${sistemas.find(s => s.id === deleteSistemaId)?.nombre}?`}
          textBtn="Eliminar"
          confirmButtonClass="btn-danger"
          onConfirm={deleteSistema}
          closeModal={closeModal}
        />
      )}
    </>
  )
}
