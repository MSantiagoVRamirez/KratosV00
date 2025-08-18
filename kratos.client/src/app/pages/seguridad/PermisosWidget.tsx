import { useState, useEffect } from "react"
import { Permiso } from "../../interfaces/seguridad/Permiso"
import { Rol } from "../../interfaces/seguridad/Rol"
import { Modulo } from "../../interfaces/seguridad/Modulo"
import permisoService from "../../services/seguridad/permisoService"
import rolService from "../../services/seguridad/rolService"
import moduloService from "../../services/seguridad/moduloService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { grid2ColStyle } from "../../utils"
import { useFormValidation } from '../../hooks/useFormValidation';

export function PermisosWidget() {

  const defaultPermiso: Permiso = {
    id: 0,
    rolId: 0,
    moduloId: 0,
    leer: false,
    editar: false,
    consultar: false,
    insertar: false,
    eliminar: false,
    exportar: false,
    importar: false
  }
  const [permisos, setPermisos] = useState<Permiso[]>([])
  const [editedPermiso, setEditedPermiso] = useState<Permiso>(defaultPermiso)
  const [deletePermisoId, setDeletePermisoId] = useState<number>(defaultPermiso.id)

  const [roles, setRoles] = useState<Rol[]>([])
  const [modulos, setModulos] = useState<Modulo[]>([])

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [showContent, setShowContent] = useState(true)

  // Palabra a buscar dentro de los permisos
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    rolId: { value: editedPermiso.rolId, required: true, type: 'select' },
    moduloId: { value: editedPermiso.moduloId, required: true, type: 'select' }
  });

  // Obtener todos los roles
  const fetchRoles = () => {
    rolService.getAll()
      .then((response) => {
        typeof (response.data) === 'string' ? setShowContent(false) : setRoles(response.data)  // Llenar la lista de roles
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los roles", error)
      })
  }

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

  // Obtener todos los permisos
  const fetchPermisos = () => {
    permisoService.getAll()
      .then((response) => {
        typeof (response.data) === 'string' ? setShowContent(false) : setPermisos(response.data)  // Llenar la lista de permisos
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los permisos", error)
      })
  }

  // Obtener todos los permisos cada vez que se renderiza el componente
  useEffect(() => {
    fetchRoles()  // Obtener todos los roles
    fetchModulos()  // Obtener todos los módulos
    fetchPermisos()  // Obtener todos los permisos
  }, [])

  // Obtener un solo permiso (para editar)
  const fetchPermiso = (id: number) => {
    permisoService.get(id)
      .then((response) => {
        setEditedPermiso(response.data)  // Llenar el estado unificado
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el permiso", error)
      })
  }

  // Crear un permiso
  const createPermiso = (data: Permiso) => {
    permisoService.create(data)
      .then(() => {
        setEditedPermiso(defaultPermiso) // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchPermisos()  // Actualizar la lista de permisos
      })
      .catch((error) => {
        console.error("Hubo un error al crear el permiso", error)
        alert(`Error al crear permiso: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar un permiso
  const updatePermiso = (data: Permiso) => {
    permisoService.update(data)
      .then(() => {
        setEditedPermiso(defaultPermiso) // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchPermisos()  // Actualizar la lista de permisos
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el permiso", error)
        alert(`Error al actualizar permiso: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar un permiso
  const deletePermiso = () => {
    permisoService.remove(deletePermisoId)
      .then(() => {
        setDeletePermisoId(defaultPermiso.id) // Limpiar el input de eliminación
        closeModal()  // Ocultar el formulario
        fetchPermisos()  // Actualizar la lista de permisos
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el permiso", error)
        alert(`Error al eliminar permiso: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeletePermisoId(id)
    setModalType('delete')
  }

  // Filtrar los permisos por la palabra a buscar
  const filteredPermisos = permisos.filter((permiso) => {
    const rolNombre = permiso.rolPermisoFk?.nombre.toLowerCase() || ''
    const moduloNombre = permiso.moduloPermisoFk?.nombre.toLowerCase() || ''
    return rolNombre.includes(searchTerm.toLowerCase()) || moduloNombre.includes(searchTerm.toLowerCase())
  })

  // Aplicar paginación a los datos
  const applyPagination = (data: Permiso[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a los permisos filtrados
  const shownPermisos = applyPagination(filteredPermisos)

  return (
    <>
      {/* Listado de Permisos */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Permisos
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
              setEditedPermiso(defaultPermiso);
              setModalType('create');
            }}>
              <KTIcon iconName="plus" className="fs-3" /> Agregar
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="card-body pb-0">
          {!showContent ? (
            <span className="text-center text-muted fs-4">No se encontraron registros.</span>
          ) : (searchTerm != "" && shownPermisos.length === 0) ? (
            <span className="text-muted fs-4">No se encontraron permisos.</span>
          ) : (
            <div className="table-responsive">
              {/* Table */}
              <table className="table align-middle gs-0 gy-3">
                {/* Table Head */}
                <thead>
                  <tr className='fw-semibold text-muted bg-light fs-6'>
                    <th className='min-w-150px rounded-start ps-5'>Rol - Módulo</th>
                    <th className='min-w-80px'>Leer</th>
                    <th className='min-w-80px'>Editar</th>
                    <th className='min-w-80px'>Consultar</th>
                    <th className='min-w-80px'>Insertar</th>
                    <th className='min-w-80px'>Eliminar</th>
                    <th className='min-w-80px'>Exportar</th>
                    <th className='min-w-80px'>Importar</th>
                    <th className='min-w-150px text-end rounded-end pe-5'>Acciones</th>
                  </tr>
                </thead>
                {/* Table Body */}
                <tbody>
                  {shownPermisos.map((permiso) => (
                    <tr key={permiso.id}>
                      <td className="d-flex">
                        <span className="bullet bullet-vertical h-40px bg-primary"></span>
                        <div className="ms-3">
                          <span className="text-gray-800 test-hover-primary fw-bold fs-6">
                            {/* { roles.find(rol => rol.id === permiso.rolId)?.nombre } */}
                            {permiso.rolPermisoFk?.nombre}
                          </span>
                          <div className="text-muted fw-semibold fs-7">
                            {/* { modulos.find(modulo => modulo.id === permiso.moduloId)?.nombre } */}
                            {permiso.moduloPermisoFk?.nombre}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge fw-semibold fs-7 ${permiso.leer ? 'badge-light-success' : 'badge-light-danger'}`}>
                          {permiso.leer ? 'Permitido' : 'Restringido'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge fw-semibold fs-7 ${permiso.editar ? 'badge-light-success' : 'badge-light-danger'}`}>
                          {permiso.editar ? 'Permitido' : 'Restringido'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge fw-semibold fs-7 ${permiso.consultar ? 'badge-light-success' : 'badge-light-danger'}`}>
                          {permiso.consultar ? 'Permitido' : 'Restringido'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge fw-semibold fs-7 ${permiso.insertar ? 'badge-light-success' : 'badge-light-danger'}`}>
                          {permiso.insertar ? 'Permitido' : 'Restringido'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge fw-semibold fs-7 ${permiso.eliminar ? 'badge-light-success' : 'badge-light-danger'}`}>
                          {permiso.eliminar ? 'Permitido' : 'Restringido'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge fw-semibold fs-7 ${permiso.exportar ? 'badge-light-success' : 'badge-light-danger'}`}>
                          {permiso.exportar ? 'Permitido' : 'Restringido'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge fw-semibold fs-7 ${permiso.importar ? 'badge-light-success' : 'badge-light-danger'}`}>
                          {permiso.importar ? 'Permitido' : 'Restringido'}
                        </span>
                      </td>
                      {permiso.rolId === 1 ? null : (
                        <td className="text-end">
                          <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchPermiso(permiso.id)}>
                            <KTIcon iconName="pencil" className="fs-3" />
                          </button>
                          <button className="btn btn-icon btn-bg-light btn-active-light-danger ms-3" onClick={() => openDeleteModal(permiso.id)}>
                            <KTIcon iconName="trash" className="fs-3" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        <Pagination
          filteredItems={filteredPermisos}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Permiso */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Permiso" : "Editar Permiso"}
            isFormValid={isFormValid}
            content={
              <div style={grid2ColStyle}>
                {/* Selects solo visibles en modo creación */}
                {modalType === 'create' && (
                  <>
                    <div className="form-group">
                      <label className="form-label required">Rol</label>
                      <select
                        value={editedPermiso.rolId}
                        onChange={(e) => setEditedPermiso({ ...editedPermiso, rolId: parseInt(e.target.value) || 0 })}
                        className="form-select"
                        required
                      >
                        <option value={0}>Seleccione un rol</option>
                        {roles.map((rol) => (
                          <option key={rol.id} value={rol.id}>
                            {rol.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label required">Módulo</label>
                      <select
                        value={editedPermiso.moduloId}
                        onChange={(e) => setEditedPermiso({ ...editedPermiso, moduloId: parseInt(e.target.value) || 0 })}
                        className="form-select"
                        required
                      >
                        <option value={0}>Seleccione un módulo</option>
                        {modulos.map((modulo) => (
                          <option key={modulo.id} value={modulo.id}>
                            {modulo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                {/* grid span 2 */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Permisos</label>
                  <div className="text-muted fs-7 mb-3">
                    Seleccione los permisos que desea otorgar al rol en el módulo seleccionado.
                  </div>
                </div>
                <div className="form-group d-flex gap-3">
                  <input
                    type="checkbox"
                    id="permiso-leer"
                    checked={!!editedPermiso.leer}
                    onChange={() => setEditedPermiso(prev => ({ ...prev, leer: !prev.leer }))}
                    className="form-check-input"
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-label" htmlFor="permiso-leer"> Leer </label>
                </div>
                <div className="form-group d-flex gap-3">
                  <input
                    type="checkbox"
                    id="permiso-editar"
                    checked={!!editedPermiso.editar}
                    onChange={() => setEditedPermiso(prev => ({ ...prev, editar: !prev.editar }))}
                    className="form-check-input"
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-label" htmlFor="permiso-editar"> Editar </label>
                </div>
                <div className="form-group d-flex gap-3">
                  <input
                    type="checkbox"
                    id="permiso-consultar"
                    checked={!!editedPermiso.consultar}
                    onChange={() => setEditedPermiso(prev => ({ ...prev, consultar: !prev.consultar }))}
                    className="form-check-input"
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-label" htmlFor="permiso-consultar"> Consultar </label>
                </div>
                <div className="form-group d-flex gap-3">
                  <input
                    type="checkbox"
                    id="permiso-insertar"
                    checked={!!editedPermiso.insertar}
                    onChange={() => setEditedPermiso(prev => ({ ...prev, insertar: !prev.insertar }))}
                    className="form-check-input"
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-label" htmlFor="permiso-insertar"> Insertar </label>
                </div>
                <div className="form-group d-flex gap-3">
                  <input
                    type="checkbox"
                    id="permiso-eliminar"
                    checked={!!editedPermiso.eliminar}
                    onChange={() => setEditedPermiso(prev => ({ ...prev, eliminar: !prev.eliminar }))}
                    className="form-check-input"
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-label" htmlFor="permiso-eliminar"> Eliminar </label>
                </div>
                <div className="form-group d-flex gap-3">
                  <input
                    type="checkbox"
                    id="permiso-exportar"
                    checked={!!editedPermiso.exportar}
                    onChange={() => setEditedPermiso(prev => ({ ...prev, exportar: !prev.exportar }))}
                    className="form-check-input"
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-label" htmlFor="permiso-exportar"> Exportar </label>
                </div>
                <div className="form-group d-flex gap-3">
                  <input
                    type="checkbox"
                    id="permiso-importar"
                    checked={!!editedPermiso.importar}
                    onChange={() => setEditedPermiso(prev => ({ ...prev, importar: !prev.importar }))}
                    className="form-check-input"
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-label" htmlFor="permiso-importar"> Importar </label>
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createPermiso(editedPermiso);
              } else {
                updatePermiso(editedPermiso);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Modal de Confirmación de Eliminación */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content={`¿Está seguro que desea eliminar el permiso para Rol: ${roles.find(r => r.id === permisos.find(p => p.id === deletePermisoId)?.rolId)?.nombre || 'Desconocido'} - Módulo: ${modulos.find(m => m.id === permisos.find(p => p.id === deletePermisoId)?.moduloId)?.nombre || 'Desconocido'}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deletePermiso}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}