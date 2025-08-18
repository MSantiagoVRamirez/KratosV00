import { useEffect, useState } from 'react';
import { TipoTaller } from '../../interfaces/talleres-hallazgos/TipoTaller';
import tipoTallerService from '../../services/talleres-hallazgos/tipoTallerService';
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from '../components/Pagination';
import { useFormValidation } from '../../hooks/useFormValidation';

export function TiposTallerWidget() {

  const defaultTipoTaller: TipoTaller = {
    id: 0,
    nombre: '',
    descripcion: ''
  };
  const [tiposTaller, setTiposTaller] = useState<TipoTaller[]>([]);
  const [editedTipoTaller, setEditedTipoTaller] = useState<TipoTaller>(defaultTipoTaller);
  const [deleteTipoTallerId, setDeleteTipoTallerId] = useState<number>(defaultTipoTaller.id);

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
    nombre: { value: editedTipoTaller.nombre, required: true, type: 'string' },
    descripcion: { value: editedTipoTaller.descripcion, required: true, type: 'string' }
  });

  // Obtener todos los proyectos
  const fetchTiposTaller = () => {
    tipoTallerService.getAll()
      .then((response) => {
        typeof (response.data) === 'string' ? setShowContent(false) : setTiposTaller(response.data)  // Llenar la lista de tipos de taller
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los tipos de taller", error)
      })
  }

  // Obtener todos los proyectos cada vez que se renderiza el componente
  useEffect(() => {
    fetchTiposTaller()  // Obtener todos los proyectos
  }, [])

  // Obtenemos un solo tipo de taller (para editar)
  const fetchTipoTaller = (id: number) => {
    tipoTallerService.get(id)
      .then((response) => {
        setEditedTipoTaller(response.data)  // Llenar el estado unificado
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el tipo de taller", error)
      })
  }

  // Crear un tipo de taller
  const createTipoTaller = (data: TipoTaller) => {
    tipoTallerService.create(data)
      .then(() => {
        setEditedTipoTaller(defaultTipoTaller)  // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchTiposTaller()  // Actualizar la lista de tipos de taller
      })
      .catch((error) => {
        console.error("Hubo un error al crear el tipo de taller", error)
        alert(`Error al crear tipo de taller: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar un tipo de taller
  const updateTipoTaller = (data: TipoTaller) => {
    tipoTallerService.update(data)
      .then(() => {
        setEditedTipoTaller(defaultTipoTaller)  // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchTiposTaller()  // Actualizar la lista de tipos de taller
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el tipo de taller", error)
        alert(`Error al actualizar tipo de taller: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar un tipo de taller
  const deleteTipoTaller = () => {
    tipoTallerService.remove(deleteTipoTallerId)
      .then(() => {
        setDeleteTipoTallerId(defaultTipoTaller.id)  // Limpiar el input de eliminación
        closeModal()  // Ocultar el formulario
        fetchTiposTaller()  // Actualizar la lista de tipos de taller
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el tipo de taller", error)
        alert(`Error al eliminar tipo de taller: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteTipoTallerId(id)  // Llenar el input de eliminación
    setModalType('delete')  // Mostrar el cuadro de diálogo de confirmación
  }

  // Filtrar los tipos de taller por la palabra a buscar
  const filteredTiposTaller = tiposTaller.filter((tipoTaller) =>
    tipoTaller.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tipoTaller.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Aplicar paginación a los datos
  const applyPagination = (data: TipoTaller[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a los tipos de taller filtrados
  const shownTiposTaller = applyPagination(filteredTiposTaller)

  // Estilo para el grid
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(600px, 1fr))',
    gap: '20px',
    padding: '20px',
  }

  return (
    <>
      {/* Listado de Tipos de Taller */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Tipos de Taller
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
              // Resetear estado
              setEditedTipoTaller(defaultTipoTaller);
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
          ) : (searchTerm != "" && shownTiposTaller.length === 0) ? (
            <span className="text-muted fs-4">No se encontraron tipos de taller.</span>
          ) : (
            shownTiposTaller.map((tipoTaller) => (
              <div className="d-flex gap-2" key={tipoTaller.id}>
                <div className="flex-grow-1 mx-3 d-flex flex-column border border-1 border-gray-300 rounded p-3">
                  <span className="text-gray-800 fw-bold d-block fs-6">
                    {tipoTaller.nombre}
                  </span>
                  <span className="text-gray-600 fs-7">
                    {tipoTaller.descripcion}
                  </span>
                </div>
                <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchTipoTaller(tipoTaller.id)}>
                  <KTIcon iconName="pencil" className="fs-3" />
                </button>
                <button className="btn btn-icon btn-bg-light btn-active-light-danger" onClick={() => openDeleteModal(tipoTaller.id)}>
                  <KTIcon iconName="trash" className="fs-3" />
                </button>
              </div>
            )))}
        </div>

        {/* Paginación */}
        <Pagination
          filteredItems={filteredTiposTaller}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Tipo de Taller */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Tipo de Taller" : "Editar Tipo de Taller"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                {/* --- Campos del Formulario usando editedTipoTaller --- */}
                <div className="form-group">
                  <label className="form-label required"> Nombre </label>
                  <input
                    type="text"
                    placeholder="Nombre del tipo de taller"
                    value={editedTipoTaller.nombre || ''}
                    onChange={(e) => setEditedTipoTaller(prev => ({ ...prev, nombre: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <span className="text-muted fs-7">
                  Asigne un nombre descriptivo al tipo de taller. Este campo será visible en la lista de tipos de taller del sistema.
                </span>
                <div className="form-group">
                  <label className="form-label required"> Descripción </label>
                  <textarea // Usar textarea para descripción
                    placeholder="Descripción opcional"
                    value={editedTipoTaller.descripcion || ''}
                    onChange={(e) => setEditedTipoTaller(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="form-control"
                    rows={3}
                    required
                  />
                </div>
                {/* --- Fin Campos del Formulario --- */}
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createTipoTaller(editedTipoTaller);
              } else {
                updateTipoTaller(editedTipoTaller);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Caja de Confirmación de Eliminación de Tipo de Taller */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Eliminar Tipo de Taller"
            content={`¿Está seguro que desea eliminar el tipo de taller "${tiposTaller.find(t => t.id === deleteTipoTallerId)?.nombre}"?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteTipoTaller}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}