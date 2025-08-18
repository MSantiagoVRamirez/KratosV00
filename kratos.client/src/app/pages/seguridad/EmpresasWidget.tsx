import { useState, useEffect } from "react"
import { Empresa } from "../../interfaces/seguridad/Empresa"
import empresaService from "../../services/seguridad/empresaService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation'

export function EmpresasWidget() {

  const defaultEmpresa: Empresa = {
    id: 0,
    nombre: "",
    nit: ""
  }
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [editedEmpresa, setEditedEmpresa] = useState<Empresa>(defaultEmpresa)
  const [deleteEmpresaId, setDeleteEmpresaId] = useState<number>(defaultEmpresa.id)

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [showContent, setShowContent] = useState(true)

  // Palabra a buscar dentro de las empresas
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    nombre: { value: editedEmpresa.nombre, required: true, type: 'string' },
    nit: { value: editedEmpresa.nit, required: true, type: 'string' }
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

  // Obtener todas las empresas cada vez que se renderiza el componente
  useEffect(() => {
    fetchEmpresas()
  }, [])

  // Obtener una sola empresa (para editar)
  const fetchEmpresa = (id: number) => {
    empresaService.get(id)
      .then((response) => {
        setEditedEmpresa(response.data)  // Llenar el estado unificado
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener la empresa", error)
      })
  }

  // Crear una empresa
  const createEmpresa = (data: Empresa) => {
    empresaService.create(data)
      .then(() => {
        setEditedEmpresa(defaultEmpresa) // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchEmpresas()  // Actualizar la lista de empresas
      })
      .catch((error) => {
        console.error("Hubo un error al crear la empresa", error)
        alert(`Error al crear empresa: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar una empresa
  const updateEmpresa = (data: Empresa) => {
    empresaService.update(data)
      .then(() => {
        setEditedEmpresa(defaultEmpresa) // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchEmpresas()  // Actualizar la lista de empresas
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar la empresa", error)
        alert(`Error al actualizar empresa: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar una empresa
  const deleteEmpresa = () => {
    empresaService.remove(deleteEmpresaId)
      .then(() => {
        setDeleteEmpresaId(defaultEmpresa.id) // Limpiar el input de eliminación
        closeModal()  // Ocultar el formulario
        fetchEmpresas()  // Actualizar la lista de empresas
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar la empresa", error)
        alert(`Error al eliminar empresa: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteEmpresaId(id)
    setModalType('delete')
  }

  // Filtrar las empresas por nombre o NIT
  const filteredEmpresas = empresas.filter((empresa) =>
    empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.nit.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Aplicar paginación a los datos
  const applyPagination = (data: Empresa[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a las empresas filtradas
  const shownEmpresas = applyPagination(filteredEmpresas)

  // Estilo para el grid
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px',
    padding: '20px',
  }

  return (
    <>
      {/* Listado de Empresas */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Empresas
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
              setEditedEmpresa(defaultEmpresa);
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
          ) : (searchTerm != "" && shownEmpresas.length === 0) ? (
            <span className="text-muted fs-4">No se encontraron empresas.</span>
          ) : (
            shownEmpresas.map((empresa) => (
              <div className="d-flex gap-2" key={empresa.id}>
                <div className="flex-grow-1 mx-3 d-flex flex-column border border-1 border-gray-300 rounded p-3">
                  <span className="text-gray-800 fw-bold fs-6">
                    {empresa.nombre}
                  </span>
                  <div className="d-block mt-1">
                    <span className="text-gray-600 fs-7">
                      {empresa.nit}
                    </span>
                  </div>
                </div>
                <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchEmpresa(empresa.id)}>
                  <KTIcon iconName="pencil" className="fs-3" />
                </button>
                <button className="btn btn-icon btn-bg-light btn-active-light-danger" onClick={() => openDeleteModal(empresa.id)}>
                  <KTIcon iconName="trash" className="fs-3" />
                </button>
              </div>
            )))}
        </div>

        {/* Paginación */}
        <Pagination
          filteredItems={filteredEmpresas}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Empresa */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Empresa" : "Editar Empresa"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                <div className="form-group">
                  <label className="form-label required">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre de la empresa"
                    value={editedEmpresa.nombre}
                    onChange={(e) => setEditedEmpresa({ ...editedEmpresa, nombre: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">NIT</label>
                  <input
                    type="text"
                    placeholder="NIT de la empresa"
                    value={editedEmpresa.nit}
                    onChange={(e) => setEditedEmpresa({ ...editedEmpresa, nit: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createEmpresa(editedEmpresa);
              } else {
                updateEmpresa(editedEmpresa);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Cuadro de Confirmación de Eliminación */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content={`¿Está seguro que desea eliminar la empresa ${empresas.find(e => e.id === deleteEmpresaId)?.nombre}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteEmpresa}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}