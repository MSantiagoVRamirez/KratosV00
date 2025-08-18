import { useState, useEffect } from "react"
import { Usuario } from "../../interfaces/seguridad/Usuario"
import { Empresa } from "../../interfaces/seguridad/Empresa"
import { Rol } from "../../interfaces/seguridad/Rol"
import usuarioService from "../../services/seguridad/usuarioService"
import empresaService from "../../services/seguridad/empresaService"
import rolService from "../../services/seguridad/rolService"
import resetPasswordService from "../../services/seguridad/resetPasswordService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { grid2ColStyle } from "../../utils"
import { useFormValidation } from '../../hooks/useFormValidation';

export function UsuariosWidget() {

  const defaultUsuario: Usuario = {
    id: 0,
    usuario: '',
    password: '12345',
    confirmPassword: '12345',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    fechaCreacion: new Date().toISOString(),  // Formato ISO 8601
    fechaExpiracion: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),  // Un año después
    empresaId: 0,
    rolId: 0
  }
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [editedUsuario, setEditedUsuario] = useState<Usuario>(defaultUsuario)
  const [deleteUsuarioId, setDeleteUsuarioId] = useState<number>(defaultUsuario.id)
  const [resetPasswordId, setResetPasswordId] = useState<number>(defaultUsuario.id)

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [roles, setRoles] = useState<Rol[]>([])

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | 'restart' | null>(null)
  const [showContent, setShowContent] = useState(true)

  // Palabra a buscar en el listado de usuarios
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    usuario: { value: editedUsuario.usuario, required: true, type: 'string' },
    nombres: { value: editedUsuario.nombres, required: true, type: 'string' },
    apellidos: { value: editedUsuario.apellidos, required: true, type: 'string' },
    correo: { value: editedUsuario.correo, required: true, type: 'email' },
    telefono: { value: editedUsuario.telefono, required: true, type: 'string' },
    empresaId: { value: editedUsuario.empresaId, required: true, type: 'select' },
    rolId: { value: editedUsuario.rolId, required: true, type: 'select' },
    fechaCreacion: { value: editedUsuario.fechaCreacion, required: true, type: 'date' },
    fechaExpiracion: { value: editedUsuario.fechaExpiracion, required: true, type: 'date' }
  });

  // Obtener todas las empresas
  const fetchEmpresas = () => {
    empresaService.getAll()
      .then((response) => {
        typeof (response.data) === 'string' ? setShowContent(false) : setEmpresas(response.data)  // Llenar la lista de empresas
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las empresas", error)
      })
  }

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

  // Obtener todos los usuarios
  const fetchUsuarios = () => {
    usuarioService.getAll()
      .then((response) => {
        typeof (response.data) === 'string' ? setShowContent(false) : setUsuarios(response.data)  // Llenar la lista de usuarios
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los usuarios", error)
      })
  }

  // Obtener todos los usuarios cada vez que se renderiza el componente
  useEffect(() => {
    fetchEmpresas()  // Obtener todas las empresas
    fetchRoles()  // Obtener todos los roles
    fetchUsuarios()  // Obtener todos los usuarios
  }, [])

  // Obtener un solo usuario (para editar)
  const fetchUsuario = (id: number) => {
    usuarioService.get(id)
      .then((response) => {
        const { password, confirmPassword, ...restData } = response.data; // Excluir contraseñas al cargar para editar
        setEditedUsuario(restData as Usuario)  // Llenar el estado unificado
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el usuario", error)
      })
  }

  // Crear un usuario
  const createUsuario = (data: Usuario) => {
    usuarioService.create(data)
      .then(() => {
        setEditedUsuario(defaultUsuario); // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        alert('El usuario ha sido creado exitosamente. Se ha asignado la contraseña 12345 por defecto. Por favor, vuelva a iniciar sesión para reestablecer contraseña.')
        fetchUsuarios()  // Actualizar la lista de usuarios
      })
      .catch((error) => {
        console.error("Hubo un error al crear el usuario", error.response?.data || error.message);
        alert(`Error al crear usuario: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar un usuario
  const updateUsuario = (data: Usuario) => {
    console.log(data)
    // Enviar el objeto 'data' completo. El backend debería ignorar password/confirmPassword si no son parte de la actualización.
    usuarioService.update(data)
      .then(() => {
        setEditedUsuario(defaultUsuario) // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchUsuarios()  // Actualizar la lista de usuarios
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el usuario", error)
        alert(`Error al actualizar usuario: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar un usuario
  const deleteUsuario = () => {
    usuarioService.remove(deleteUsuarioId)
      .then(() => {
        setDeleteUsuarioId(defaultUsuario.id) // Limpiar el input de eliminación
        closeModal()  // Ocultar el formulario
        fetchUsuarios()  // Actualizar la lista de usuarios
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el usuario", error)
        alert(`Error al eliminar usuario: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteUsuarioId(id)
    setModalType('delete')
  }

  // Restablecer la contraseña de un usuario
  const resetPassword = () => {
    const nombreUsuario = usuarios.find(usuario => usuario.id === resetPasswordId)?.usuario || ''
    resetPasswordService.editarPassword(nombreUsuario, {
      password: '12345',
      confirmPassword: '12345',
    })
      .then(() => {
        setResetPasswordId(defaultUsuario.id) // Limpiar el input de restablecimiento
        closeModal()  // Ocultar el formulario
      })
      .catch((error) => {
        console.error("Hubo un error al restablecer la contraseña", error)
      })
    window.alert('La contraseña se ha restablecido temporalmente a 12345. Por favor, vuelva a iniciar sesión para reestablecer contraseña.')
  }

  // Mostrar el cuadro de diálogo de confirmar restablecimiento de contraseña
  const openResetModal = (id: number) => {
    setResetPasswordId(id)
    setModalType('restart')
  }

  // Filtrar usuarios por la palabra a buscar
  const filteredUsuarios = usuarios.filter(usuario => {
    const fullName = `${usuario.nombres} ${usuario.apellidos}`.toLowerCase()
    const empresaNombre = usuario.empresaUsuarioFk?.nombre.toLowerCase() || ''
    const rolNombre = usuario.rolUsuarioFk?.nombre.toLowerCase() || ''
    const fechaCreacion = !usuario.fechaCreacion ? '' : new Date(usuario.fechaCreacion).toLocaleDateString().toLowerCase()
    const fechaExpiracion = !usuario.fechaExpiracion ? '' : new Date(usuario.fechaExpiracion).toLocaleDateString().toLowerCase()

    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      usuario.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.telefono.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresaNombre.includes(searchTerm.toLowerCase()) ||
      rolNombre.includes(searchTerm.toLowerCase()) ||
      fechaCreacion.includes(searchTerm.toLowerCase()) ||
      fechaExpiracion.includes(searchTerm.toLowerCase())
    )
  })

  // Aplicar paginación a los datos
  const applyPagination = (data: Usuario[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a los usuarios filtrados
  const shownUsuarios = applyPagination(filteredUsuarios)

  const rolesCenit = roles.filter(rol => rol.id === 1 || rol.id === 2 || rol.id === 3 || rol.id === 7 || rol.id === 8);
  const rolesContratista = roles.filter(rol => rol.id === 2 || rol.id === 9);

  const rolesList = editedUsuario.empresaId === 1 ? rolesCenit : rolesContratista;

  return (
    <>
      {/* Listado de Usuarios */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Usuarios
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
              setEditedUsuario(defaultUsuario); // Resetear estado al abrir creación
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
          ) : (searchTerm != "" && shownUsuarios.length === 0) ? (
            <span className="text-muted fs-4">No se encontraron usuarios.</span>
          ) : (
            <div className="table-responsive">
              {/* Table */}
              <table className="table align-middle gs-0 gy-3">
                {/* Table Head */}
                <thead>
                  <tr className='fw-semibold text-muted bg-light fs-6'>
                    <th className='min-w-150px rounded-start ps-5'>Usuario - Rol</th>
                    <th className='min-w-150px'>Nombre - Empresa</th>
                    <th className='min-w-150px'>Datos de contacto</th>
                    <th className='min-w-150px'>Fechas C/E</th>
                    <th className='min-w-210px text-end rounded-end pe-5'>Acciones</th>
                  </tr>
                </thead>
                {/* Table Body */}
                <tbody>
                  {shownUsuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td className="d-flex align-items-center gap-3">
                        <span className="bullet bullet-vertical h-40px bg-primary"></span>
                        <div className="d-flex flex-column gap-1">
                          <span className="fw-bold d-block fs-6">{usuario.usuario}</span>
                          <span className="badge badge-light-primary fs-8">
                            {/* {roles.find(rol => rol.id === usuario.rolId)?.nombre} */}
                            {usuario.rolUsuarioFk?.nombre}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="d-block fs-7 mb-1">{usuario.nombres} {usuario.apellidos}</span>
                        <span className="badge badge-light fs-8">
                          {/* {empresas.find(empresa => empresa.id === usuario.empresaId)?.nombre} */}
                          {usuario.empresaUsuarioFk?.nombre}
                        </span>
                      </td>
                      <td>
                        <span className="d-block fs-7 mb-1">{usuario.correo}</span>
                        <span className="text-muted d-block fs-7">{usuario.telefono}</span>
                      </td>
                      <td>
                        <span className="d-block fs-7 mb-1">{!usuario.fechaCreacion ? '' : new Date(usuario.fechaCreacion).toLocaleDateString()}</span>
                        <span className="text-muted d-block fs-7">{!usuario.fechaExpiracion ? '' : new Date(usuario.fechaExpiracion).toLocaleDateString()}</span>
                      </td>
                      <td className="text-end">
                        {usuario.rolId === 1 ? (
                          null
                        ) : (
                          <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchUsuario(usuario.id)}>
                            <KTIcon iconName="pencil" className="fs-3" />
                          </button>
                        )}
                        {/* Botón para retablecer la contraseña a 12345 */}
                        <button className="btn btn-icon btn-bg-light btn-active-light-warning ms-3" onClick={() => openResetModal(usuario.id)}>
                          <KTIcon iconName="key" className="fs-3" />
                        </button>
                        {usuario.rolId === 1 ? (
                          null
                        ) : (
                          <button className="btn btn-icon btn-bg-light btn-active-light-danger ms-3" onClick={() => openDeleteModal(usuario.id)}>
                            <KTIcon iconName="trash" className="fs-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        <Pagination
          filteredItems={filteredUsuarios}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Usuario */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Usuario" : "Editar Usuario"}
            isFormValid={isFormValid}
            content={
              <div style={grid2ColStyle}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label required">Usuario</label>
                  <input
                    type="text"
                    placeholder="Nombre del usuario"
                    value={editedUsuario.usuario || ''}
                    onChange={(e) => setEditedUsuario(prev => ({ ...prev, usuario: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Nombres</label>
                  <input
                    type="text"
                    placeholder="Nombres del usuario"
                    value={editedUsuario.nombres || ''}
                    onChange={(e) => setEditedUsuario(prev => ({ ...prev, nombres: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Apellidos</label>
                  <input
                    type="text"
                    placeholder="Apellidos del usuario"
                    value={editedUsuario.apellidos || ''}
                    onChange={(e) => setEditedUsuario(prev => ({ ...prev, apellidos: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Correo</label>
                  <input
                    type="email"
                    placeholder="Correo del usuario"
                    value={editedUsuario.correo || ''}
                    onChange={(e) => setEditedUsuario(prev => ({ ...prev, correo: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Teléfono</label>
                  <input
                    type="text"
                    placeholder="Teléfono del usuario"
                    value={editedUsuario.telefono || ''}
                    onChange={(e) => setEditedUsuario(prev => ({ ...prev, telefono: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Empresa</label>
                  <select
                    value={editedUsuario.empresaId || 0}
                    onChange={(e) => setEditedUsuario(prev => ({ ...prev, empresaId: parseInt(e.target.value) || 0 }))}
                    className="form-select"
                    required
                  >
                    <option value={0}>Seleccione una empresa</option>
                    {empresas.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Rol</label>
                  <select
                    value={editedUsuario.rolId || 0}
                    onChange={(e) => setEditedUsuario(prev => ({ ...prev, rolId: parseInt(e.target.value) || 0 }))}
                    className="form-select"
                    required
                  >
                    <option value={0}>Seleccione un rol</option>
                    {rolesList.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => { // Llamar a la función correcta con el estado unificado
              if (modalType === 'create') {
                createUsuario(editedUsuario);
              } else {
                updateUsuario(editedUsuario);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Caja de Confirmación de Eliminación de Usuario */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación" // Título actualizado
            // Mensaje actualizado
            content={`¿Está seguro que desea eliminar el usuario ${usuarios.find(u => u.id === deleteUsuarioId)?.usuario}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger" // Usar prop para botón rojo
            onConfirm={deleteUsuario}
            closeModal={closeModal}
          />
        )}

        {/* Caja de Confirmación de Reeestablecimiento de Contraseña */}
        {modalType === 'restart' && (
          <ModalDialog
            title="Confirmar Restablecimiento" // Título actualizado
            // Mensaje actualizado
            content={`¿Está seguro que desea restablecer la contraseña del usuario ${usuarios.find(u => u.id === resetPasswordId)?.usuario}?`}
            textBtn="Restablecer"
            confirmButtonClass="btn-warning" // Usar prop para botón amarillo
            onConfirm={resetPassword}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}