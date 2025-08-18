import { useEffect, useState } from 'react';
import { Disciplina } from '../../interfaces/talleres-hallazgos/Disciplina';
import disciplinaService from '../../services/talleres-hallazgos/disciplinaService';
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from '../components/Pagination';
import { useFormValidation } from '../../hooks/useFormValidation';

export function DisciplinasWidget() {

  const defaultDisciplina: Disciplina = {
    id: 0,
    nombre: "",
    descripcion: ""
  };
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [editedDisciplina, setEditedDisciplina] = useState<Disciplina>(defaultDisciplina);
  const [deleteDisciplinaId, setDeleteDisciplinaId] = useState<number>(defaultDisciplina.id);

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
    nombre: { value: editedDisciplina.nombre, required: true, type: 'string' },
    descripcion: { value: editedDisciplina.descripcion, required: true, type: 'string' }
  });

  // Obtener todos las disciplinas
  const fetchDisciplinas = () => {
    disciplinaService.getAll()
      .then((response) => {
        typeof (response.data) === 'string' ? setShowContent(false) : setDisciplinas(response.data)  // Llenar la lista de disciplinas
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las disciplinas", error)
      })
  }

  // Obtener todos las disciplinas cada vez que se renderiza el componente
  useEffect(() => {
    fetchDisciplinas()  // Obtener todos las disciplinas
  }, [])

  // Obtenemos una sola disciplina (para editar)
  const fetchDisciplina = (id: number) => {
    disciplinaService.get(id)
      .then((response) => {
        setEditedDisciplina(response.data)  // Llenar el estado unificado
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener la disciplina", error)
      })
  }

  // Crear una disciplina
  const createDisciplina = (data: Disciplina) => {
    disciplinaService.create(data)
      .then(() => {
        setEditedDisciplina(defaultDisciplina)  // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchDisciplinas()  // Actualizar la lista de disciplinas
      })
      .catch((error) => {
        console.error("Hubo un error al crear la disciplina", error)
        alert(`Error al crear disciplina: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar una disciplina
  const updateDisciplina = (data: Disciplina) => {
    disciplinaService.update(data)
      .then(() => {
        setEditedDisciplina(defaultDisciplina)  // Resetear estado unificado
        closeModal()  // Ocultar el formulario
        fetchDisciplinas()  // Actualizar la lista de disciplinas
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar la disciplina", error)
        alert(`Error al actualizar disciplina: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar una disciplina
  const deleteDisciplina = () => {
    disciplinaService.remove(deleteDisciplinaId)
      .then(() => {
        setDeleteDisciplinaId(defaultDisciplina.id)  // Limpiar el input de eliminación
        closeModal()  // Ocultar el formulario
        fetchDisciplinas()  // Actualizar la lista de disciplinas
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar la disciplina", error)
        alert(`Error al eliminar disciplina: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteDisciplinaId(id)  // Llenar el input de eliminación
    setModalType('delete')  // Mostrar el cuadro de diálogo de confirmación
  }

  // Filtrar las disciplinas por la palabra a buscar
  const filteredDisciplinas = disciplinas.filter((disciplina) =>
    disciplina.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    disciplina.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Aplicar paginación a los datos
  const applyPagination = (data: Disciplina[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a las disciplinas filtradas
  const shownDisciplinas = applyPagination(filteredDisciplinas)

  // Estilo para el grid
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(600px, 1fr))',
    gap: '20px',
    padding: '20px',
  }

  return (
    <>
      {/* Listado de Disciplinas */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Disciplinas
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
              setEditedDisciplina(defaultDisciplina);
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
          ) : (searchTerm != "" && shownDisciplinas.length === 0) ? (
            <span className="text-muted fs-4">No se encontraron disciplinas.</span>
          ) : (
            shownDisciplinas.map((disciplina) => (
              <div className="d-flex gap-2" key={disciplina.id}>
                <div className="flex-grow-1 mx-3 d-flex flex-column border border-1 border-gray-300 rounded p-3">
                  <span className="text-gray-800 fw-bold d-block fs-6">
                    {disciplina.nombre}
                  </span>
                  <span className="text-gray-600 fs-7">
                    {disciplina.descripcion}
                  </span>
                </div>
                <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchDisciplina(disciplina.id)}>
                  <KTIcon iconName="pencil" className="fs-3" />
                </button>
                <button className="btn btn-icon btn-bg-light btn-active-light-danger" onClick={() => openDeleteModal(disciplina.id)}>
                  <KTIcon iconName="trash" className="fs-3" />
                </button>
              </div>
            )))}
        </div>

        {/* Paginación */}
        <Pagination
          filteredItems={filteredDisciplinas}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Disciplina */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Disciplina" : "Editar Disciplina"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                {/* --- Campos del Formulario usando editedDisciplina --- */}
                <div className="form-group">
                  <label className="form-label required"> Nombre </label>
                  <input
                    type="text"
                    placeholder="Nombre de la disciplina"
                    value={editedDisciplina.nombre || ''}
                    onChange={(e) => setEditedDisciplina(prev => ({ ...prev, nombre: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <span className="text-muted fs-7">
                  Asigne un nombre descriptivo a la disciplina. Este campo será visible en la lista de disciplinas del sistema.
                </span>
                <div className="form-group">
                  <label className="form-label required"> Descripción </label>
                  <textarea // Usar textarea para descripción
                    placeholder="Descripción opcional"
                    value={editedDisciplina.descripcion || ''}
                    onChange={(e) => setEditedDisciplina(prev => ({ ...prev, descripcion: e.target.value }))}
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
                createDisciplina(editedDisciplina);
              } else {
                updateDisciplina(editedDisciplina);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Caja de Confirmación de Eliminación de Disciplina */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Eliminar Disciplina"
            content={`¿Está seguro que desea eliminar la disciplina "${disciplinas.find(d => d.id === deleteDisciplinaId)?.nombre}"?`} // Mensaje mejorado
            textBtn="Eliminar"
            confirmButtonClass="btn-danger" // Botón rojo
            onConfirm={deleteDisciplina}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}