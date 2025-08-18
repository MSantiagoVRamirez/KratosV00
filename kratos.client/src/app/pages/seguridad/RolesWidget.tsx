import { useState, useEffect } from "react"
import { Rol } from "../../interfaces/seguridad/Rol"
import rolService from "../../services/seguridad/rolService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation'

export function RolesWidget() {

  const defaultRol: Rol = {
    id: 0,
    nombre: "",
    estado: false
  }
  const [roles, setRoles] = useState<Rol[]>([])
  const [editedRol, setEditedRol] = useState<Rol>(defaultRol)
  const [deleteRolId, setDeleteRolId] = useState<number>(defaultRol.id)

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [showContent, setShowContent] = useState(true)

  // Palabra a buscar dentro de los roles
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    nombre: { value: editedRol.nombre, required: true, type: 'string' },
  });

  // Obtener todos los roles
  const fetchRoles = () => {
    rolService.getAll()
      .then((response) => {
        typeof (response.data) === 'string' ? setShowContent(false) : setRoles(response.data)  // Llenar la lista de módulos
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los roles", error)
      })
  }

  // Obtener todos los roles cada vez que se renderiza el componente
  useEffect(() => {
    fetchRoles()
  }, [])

  // Obtener un solo rol (para editar)
  const fetchRol = (id: number) => {
    rolService.get(id)
      .then((response) => {
        setEditedRol(response.data)  // Llenar el estado unificado
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el rol", error)
      })
  }

  // Crear un rol
  const createRol = (data: Rol) => {
    rolService.create(data)
      .then(() => {
        setEditedRol(defaultRol); // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchRoles()  // Actualizar la lista de roles
      })
      .catch((error) => {
        console.error("Hubo un error al crear el rol", error)
        alert(`Error al crear rol: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar un rol
  const updateRol = (data: Rol) => {
    if (data.nombre === 'root' && roles.find(r => r.id === data.id)?.nombre === 'root') {
      console.warn("Intento de modificar el rol 'root' bloqueado.");
      closeModal();
      return;
    }
    rolService.update(data)
      .then(() => {
        setEditedRol(defaultRol) // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchRoles()  // Actualizar la lista de roles
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el rol", error)
        alert(`Error al actualizar rol: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar un rol
  const deleteRol = () => {
    rolService.remove(deleteRolId)
      .then(() => {
        setDeleteRolId(defaultRol.id) // Limpiar el input de eliminación
        closeModal()  // Ocultar el popup de Confirmación
        fetchRoles()  // Actualizar la lista de roles
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el rol", error)
        alert(`Error al eliminar rol: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteRolId(id)
    setModalType('delete')
  }

  // Filtrar los roles por nombre
  const filteredRoles = roles.filter((rol) =>
    rol.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Aplicar paginación a los datos
  const applyPagination = (data: Rol[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a los roles filtrados
  const shownRoles = applyPagination(filteredRoles)

  // Estilo para el grid
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px',
    padding: '20px',
  }

  return (
    <>
      {/* Listado de Roles */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Roles
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
              setEditedRol(defaultRol);
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
          ) : (searchTerm != "" && shownRoles.length === 0) ? (
            <span className="text-muted fs-4">No se encontraron roles.</span>
          ) : (
            shownRoles.map((rol) => (
              <div className="d-flex gap-2" key={rol.id}>
                <div className="flex-grow-1 mx-3 d-flex flex-column border border-1 border-gray-300 rounded p-3">
                  <span className="text-gray-800 fw-bold fs-6">
                    {rol.nombre}
                  </span>
                  <div className="d-block mt-1">
                    <span className={`badge fs-7 fw-bold ${rol.estado ? "badge-light-success" : "badge-light-danger"}`}>
                      {rol.estado ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
                <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchRol(rol.id)}>
                  <KTIcon iconName="pencil" className="fs-3" />
                </button>
                { // Si el rol es 'root', no mostrar el botón de eliminar
                  rol.nombre !== "root" && (
                    <button className="btn btn-icon btn-bg-light btn-active-light-danger" onClick={() => openDeleteModal(rol.id)}>
                      <KTIcon iconName="trash" className="fs-3" />
                    </button>
                  )
                }
              </div>
            )))}
        </div>

        {/* Paginación */}
        <Pagination
          filteredItems={filteredRoles}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Rol */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Rol" : "Editar Rol"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                <div className="form-group">
                  <label className="form-label required"> Nombre </label>
                  <input
                    type="text"
                    placeholder="Nombre del rol"
                    value={editedRol.nombre}
                    onChange={(e) => setEditedRol(prev => ({ ...prev, nombre: e.target.value }))}
                    className="form-control"
                    required
                    disabled={modalType === 'edit' && editedRol.nombre === 'root'}
                  />
                  {modalType === 'edit' && editedRol.nombre === 'root' && (
                    <div className="text-muted fs-7 mt-1">El rol 'root' no puede ser renombrado.</div>
                  )}
                </div>
                <span className="text-muted fs-7 mt-1">
                  Active el rol para que esté disponible en el sistema. Los roles inactivos no podrán ser asignados a usuarios.
                </span>
                <div className="form-group d-flex gap-3">
                  <input
                    type="checkbox"
                    id="rol-estado-check"
                    checked={!!editedRol.estado}
                    onChange={() => setEditedRol(prev => ({ ...prev, estado: !prev.estado }))}
                    className="form-check-input"
                    style={{ cursor: 'pointer' }}
                    disabled={modalType === 'edit' && editedRol.nombre === 'root'}
                  />
                  <label className="form-label" htmlFor="rol-estado-check"> Activo </label>
                  {modalType === 'edit' && editedRol.nombre === 'root' && (
                    <div className="text-muted fs-7 mt-1">El estado del rol 'root' no puede ser modificado.</div>
                  )}
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createRol(editedRol);
              } else {
                if (editedRol.nombre === 'root') {
                  console.warn("Submit bloqueado para rol 'root'.");
                  closeModal();
                  return;
                }
                updateRol(editedRol);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Cuadro de Confirmación de Eliminación */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content={`¿Está seguro que desea eliminar el rol ${roles.find(r => r.id === deleteRolId)?.nombre}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteRol}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}