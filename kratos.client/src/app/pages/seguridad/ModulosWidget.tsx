import { useState, useEffect } from "react"
import { Modulo } from "../../interfaces/seguridad/Modulo"
import moduloService from "../../services/seguridad/moduloService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation'

export function ModulosWidget() {

  const defaultModulo: Modulo = {
    id: 0,
    nombre: "",
    estado: true
  }
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [editedModulo, setEditedModulo] = useState<Modulo>(defaultModulo)
  const [deleteModuloId, setDeleteModuloId] = useState<number>(defaultModulo.id)

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [showContent, setShowContent] = useState(true)

  // Palabra a buscar dentro de los módulos
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    nombre: { value: editedModulo.nombre, required: true, type: 'string' }
  });

  // Obtener todos los módulos
  const fetchModulos = () => {
    moduloService.getAll()
      .then((response) => {
        typeof (response.data) === 'string' ? setShowContent(false) : setModulos(response.data)  // Llenar la lista de módulos
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los módulos", error)
      })
  }

  // Obtener todos los módulos cada vez que se renderiza el componente
  useEffect(() => {
    fetchModulos()
  }, [])

  // Obtener un solo módulo (para editar)
  const fetchModulo = (id: number) => {
    moduloService.get(id)
      .then((response) => {
        setEditedModulo(response.data)  // Llenar el estado unificado
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el módulo", error)
      })
  }

  // Crear un módulo
  const createModulo = (data: Modulo) => {
    moduloService.create(data)
      .then(() => {
        setEditedModulo(defaultModulo) // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchModulos()  // Actualizar la lista de módulos
      })
      .catch((error) => {
        console.error("Hubo un error al crear el módulo", error)
        alert(`Error al crear módulo: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar un módulo
  const updateModulo = (data: Modulo) => {
    moduloService.update(data)
      .then(() => {
        setEditedModulo(defaultModulo) // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchModulos()  // Actualizar la lista de módulos
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el módulo", error)
        alert(`Error al actualizar módulo: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar un módulo
  const deleteModulo = () => {
    moduloService.remove(deleteModuloId)
      .then(() => {
        setDeleteModuloId(defaultModulo.id) // Limpiar el input de eliminación
        closeModal()  // Ocultar el popup de Confirmación
        fetchModulos()  // Actualizar la lista de módulos
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el módulo", error)
        alert(`Error al eliminar módulo: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteModuloId(id)
    setModalType('delete')
  }

  // Filtrar módulos por nombre
  const filteredModulos = modulos.filter((modulo) =>
    modulo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Aplicar paginación a los datos
  const applyPagination = (data: Modulo[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a los módulos filtrados
  const shownModulos = applyPagination(filteredModulos)

  // Estilo para el grid
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px',
    padding: '20px',
  }

  return (
    <>
      {/* Listado de Módulos */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Módulos
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
              setEditedModulo(defaultModulo);
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
          ) : (searchTerm != "" && shownModulos.length === 0) ? (
            <span className="text-muted fs-4">No se encontraron módulos.</span>
          ) : (
            shownModulos.map((modulo) => (
              <div className="d-flex gap-2" key={modulo.id}>
                <div className="flex-grow-1 mx-3 d-flex flex-column border border-1 border-gray-300 rounded p-3">
                  <span className="text-gray-800 fw-bold fs-6">
                    {modulo.nombre}
                  </span>
                  <div className="d-block mt-1">
                    <span className={`badge fs-7 fw-bold ${modulo.estado ? "badge-light-success" : "badge-light-danger"}`}>
                      {modulo.estado ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
                <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchModulo(modulo.id)}>
                  <KTIcon iconName="pencil" className="fs-3" />
                </button>
                <button className="btn btn-icon btn-bg-light btn-active-light-danger" onClick={() => openDeleteModal(modulo.id)}>
                  <KTIcon iconName="trash" className="fs-3" />
                </button>
              </div>
            )))}
        </div>

        {/* Paginación */}
        <Pagination
          filteredItems={filteredModulos}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Módulo */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Módulo" : "Editar Módulo"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                <div className="form-group">
                  <label className="form-label required">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre del módulo"
                    value={editedModulo.nombre}
                    onChange={(e) => {
                      setEditedModulo(prev => ({ ...prev, nombre: e.target.value }));
                    }}
                    className="form-control"
                    required
                  />
                </div>
                <span className="text-muted fs-7">
                  Active el módulo para que esté disponible en el sistema. Los módulos inactivos no serán visibles para los usuarios.
                </span>
                <div className="form-group mt-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      checked={editedModulo.estado}
                      onChange={() => {
                        setEditedModulo(prev => ({ ...prev, estado: !prev.estado }));
                      }}
                      className="form-check-input"
                      id="modulo-estado-check"
                    />
                    <label className="form-check-label" htmlFor="modulo-estado-check">Activo</label>
                  </div>
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createModulo(editedModulo);
              } else {
                updateModulo(editedModulo);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Cuadro de Confirmación de Eliminación */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content={`¿Está seguro que desea eliminar el módulo ${modulos.find(modulo => modulo.id === deleteModuloId)?.nombre}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteModulo}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}