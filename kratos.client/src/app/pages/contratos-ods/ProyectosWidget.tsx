import { useState, useEffect } from "react"
import { Proyecto } from "../../interfaces/contratos-ods/Proyecto"
import { Usuario } from "../../interfaces/seguridad/Usuario"
import proyectoService from "../../services/contratos-ods/proyectoService"
import usuarioService from "../../services/seguridad/usuarioService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation'

export function ProyectosWidget() {

  const defaultProyecto: Proyecto = {
    id: 0,
    nombre: "",
    liderId: 0,
    descripcion: ""
  }
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [editedProyecto, setEditedProyecto] = useState<Proyecto>(defaultProyecto)
  const [deleteProyectoId, setDeleteProyectoId] = useState<number>(defaultProyecto.id)

  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [showContent, setShowContent] = useState(true)

  // Palabra a buscar dentro de los proyectos
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    nombre: { value: editedProyecto.nombre, required: true, type: 'string' },
    descripcion: { value: editedProyecto.descripcion, required: true, type: 'string' }
  });

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

  // Obtener todos los proyectos
  const fetchProyectos = () => {
    proyectoService.getAll()
      .then((response) => {
        typeof (response.data) === 'string' ? setShowContent(false) : setProyectos(response.data)  // Llenar la lista de proyectos
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los proyectos", error)
      })
  }

  // Obtener todos los proyectos cada vez que se renderiza el componente
  useEffect(() => {
    fetchUsuarios()  // Obtener todos los usuarios
    fetchProyectos()  // Obtener todos los proyectos
  }, [])

  // Obtener un solo proyecto (para editar)
  const fetchProyecto = (id: number) => {
    proyectoService.get(id)
      .then((response) => {
        setEditedProyecto(response.data)  // Llenar el estado unificado
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el proyecto", error)
      })
  }

  // Crear un proyecto
  const createProyecto = (data: Proyecto) => {
    proyectoService.create(data)
      .then(() => {
        setEditedProyecto(defaultProyecto) // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchProyectos()  // Actualizar la lista de proyectos
      })
      .catch((error) => {
        console.error("Hubo un error al crear el proyecto", error)
        alert(`Error al crear proyecto: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar un proyecto
  const updateProyecto = (data: Proyecto) => {
    proyectoService.update(data)
      .then(() => {
        setEditedProyecto(defaultProyecto) // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchProyectos()  // Actualizar la lista de proyectos
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el proyecto", error)
        alert(`Error al actualizar proyecto: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar un proyecto
  const deleteProyecto = () => {
    proyectoService.remove(deleteProyectoId)
      .then(() => {
        setDeleteProyectoId(defaultProyecto.id) // Limpiar el input de eliminación
        closeModal()  // Ocultar el formulario
        fetchProyectos()  // Actualizar la lista de proyectos
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el proyecto", error)
        alert(`Error al eliminar proyecto: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteProyectoId(id)  // Llenar el input de eliminación
    setModalType('delete')  // Mostrar el cuadro de diálogo de confirmación
  }

  // Filtrar los proyectos por la palabra a buscar
  const filteredProyectos = proyectos.filter((proyecto) =>
    proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proyecto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (proyecto.liderProyectoFk?.usuario || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Aplicar paginación a los datos
  const applyPagination = (data: Proyecto[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a los proyectos filtrados
  const shownProyectos = applyPagination(filteredProyectos)

  return (
    <>
      {/* Listado de Proyectos */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Proyectos
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
              setEditedProyecto(defaultProyecto);
              setModalType('create');
            }}>
              <KTIcon iconName="plus" className="fs-3" /> Agregar
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="card-body d-flex flex-column gap-5">
          {!showContent ? (
            <span className="text-muted fs-4">No se encontraron registros.</span>
          ) : (searchTerm != "" && shownProyectos.length === 0) ? (
            <span className="text-muted fs-4">No se encontraron proyectos.</span>
          ) : (
            shownProyectos.map((proyecto) => (
              <div className="d-flex gap-2" key={proyecto.id}>
                <span className="bullet bullet-vertical h-40px bg-primary"></span>
                <div className="d-flex flex-column gap-1 mx-3" style={{ width: "100px" }}>
                  <span className="text-muted fs-8 fw-bold">
                    Líder
                  </span>
                  <span className="badge badge-light-primary fs-7 fw-bold" style={{ width: "fit-content" }}>
                    {usuarios.find(usuario => usuario.id === proyecto.liderId)?.usuario}
                    {/* {proyecto.liderProyectoFk?.usuario} */}
                  </span>
                </div>
                <div className="flex-grow-1">
                  <span className="text-gray-800 fw-bold d-block fs-6">
                    {proyecto.nombre}
                  </span>
                  <span className="text-gray-600 fs-7">
                    {proyecto.descripcion}
                  </span>
                </div>
                <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchProyecto(proyecto.id)}>
                  <KTIcon iconName="pencil" className="fs-3" />
                </button>
                <button className="btn btn-icon btn-bg-light btn-active-light-danger" onClick={() => openDeleteModal(proyecto.id)}>
                  <KTIcon iconName="trash" className="fs-3" />
                </button>
              </div>
            )))}
        </div>

        {/* Paginación */}
        <Pagination
          filteredItems={filteredProyectos}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Proyecto */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Proyecto" : "Editar Proyecto"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                <div className="form-group">
                  <label className="form-label required">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre del proyecto"
                    value={editedProyecto.nombre}
                    onChange={(e) => setEditedProyecto(prev => ({ ...prev, nombre: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Líder</label>
                  <select
                    value={editedProyecto.liderId}
                    onChange={(e) => setEditedProyecto(prev => ({ ...prev, liderId: parseInt(e.target.value) }))}
                    className="form-select"
                    required
                  >
                    <option value={0}>Seleccionar un líder</option>
                                    {usuarios.sort((a, b) => a.usuario.localeCompare(b.usuario)).map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>{usuario.usuario}</option>
                ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Descripción</label>
                  <textarea
                    placeholder="Descripción del proyecto"
                    value={editedProyecto.descripcion}
                    onChange={(e) => setEditedProyecto(prev => ({ ...prev, descripcion: e.target.value }))}
                    rows={3}
                    className="form-control"
                    required
                  />
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createProyecto(editedProyecto);
              } else {
                updateProyecto(editedProyecto);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Confirmar Eliminación */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content={`¿Está seguro que desea eliminar el proyecto ${proyectos.find(p => p.id === deleteProyectoId)?.nombre}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteProyecto}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}