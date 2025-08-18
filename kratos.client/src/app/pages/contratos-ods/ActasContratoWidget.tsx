import { useState, useEffect } from "react"
import { ActaContrato } from "../../interfaces/contratos-ods/ActaContrato"
import { Contrato } from "../../interfaces/contratos-ods/Contrato"
import actaContratoService from "../../services/contratos-ods/actaContratoService"
import contratoService2 from "../../services/contratos-ods/contratoService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation';

export function ActasContratoWidget({ selectedContratoId, onUpdate }: { selectedContratoId: number, onUpdate?: () => void }) {

  const defaultActaContrato: ActaContrato = {
    id: 0,
    contratoId: selectedContratoId,
    nombre: '',
    descripcion: '',
    documento: null
  }
  const [actasContrato, setActasContrato] = useState<ActaContrato[]>([])
  const [editedActaContrato, setEditedActaContrato] = useState<ActaContrato>(defaultActaContrato)
  const [deleteActaContratoId, setDeleteActaContratoId] = useState<number>(defaultActaContrato.id)

  const [contratos, setContratos] = useState<Contrato[]>([])

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | 'restart' | null>(null)

  // Palabra a buscar en el listado de usuarios
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    contratoId: { value: editedActaContrato.contratoId, required: true, type: 'number' },
    nombre: { value: editedActaContrato.nombre, required: true, type: 'string' },
    descripcion: { value: editedActaContrato.descripcion, required: true, type: 'string' },
  });

  // Obtener todos los contratos
  const fetchContratos = () => {
    contratoService2.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setContratos(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los contratos", error)
      })
  }

  // Obtener todas las actas de contrato
  const fetchActasContrato = () => {
    actaContratoService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setActasContrato(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las actas de contrato", error)
      })
  }

  // Obtener todas las actas de contrato cada vez que se renderiza el componente
  useEffect(() => {
    fetchContratos()  // Obtener todos los contratos
    fetchActasContrato()  // Obtener todas las actas de contrato
  }, [])

  // Obtener una sola acta de contrato (para editar)
  const fetchActaContrato = (id: number) => {
    actaContratoService.get(id)
      .then((response) => {
        setEditedActaContrato(response.data)  // Llenar el estado unificado
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el acta de contrato", error)
      })
  }

  // Crear un acta de contrato
  const createActaContrato = (data: ActaContrato) => {
    const dataToSend = { ...data, contratoId: data.contratoId || selectedContratoId };
    actaContratoService.create(dataToSend)
      .then(() => {
        setEditedActaContrato(defaultActaContrato) // Resetear estado unificado
        alert("Acta de contrato creada exitosamente")
        closeModal()  // Ocultar el formulario
        fetchActasContrato()  // Actualizar la lista de actas de contrato
        if (onUpdate) onUpdate(); // Llamar a onUpdate si existe
      })
      .catch((error) => {
        console.error("Hubo un error al crear el acta de contrato", error)
        alert(`Error al crear acta de contrato: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar un acta de contrato
  const updateActaContrato = (data: ActaContrato) => {
    const dataToSend = { ...data, contratoId: data.contratoId || selectedContratoId };
    actaContratoService.update(dataToSend)
      .then(() => {
        setEditedActaContrato(defaultActaContrato) // Resetear estado unificado
        alert("Acta de contrato actualizada exitosamente")
        closeModal()  // Ocultar el formulario
        fetchActasContrato()  // Actualizar la lista de actas de contrato
        if (onUpdate) onUpdate(); // Llamar a onUpdate si existe
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el acta de contrato", error)
        alert(`Error al actualizar acta de contrato: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar un acta de contrato
  const deleteActaContrato = () => {
    actaContratoService.remove(deleteActaContratoId)
      .then(() => {
        // Actualizar inmediatamente el estado local removiendo el elemento eliminado
        setActasContrato(prevActasContrato => 
          prevActasContrato.filter(actaContrato => actaContrato.id !== deleteActaContratoId)
        )
        setDeleteActaContratoId(defaultActaContrato.id) // Limpiar el input de eliminación
        alert("Acta de contrato eliminada exitosamente")
        closeModal()  // Ocultar el formulario
        // También hacer fetch para asegurar sincronización con el servidor
        fetchActasContrato()  // Actualizar la lista de actas de contrato
        if (onUpdate) onUpdate(); // Llamar a onUpdate si existe
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el acta de contrato", error)
        alert(`Error al eliminar acta de contrato: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteActaContratoId(id)
    setModalType('delete')
  }

  // Filtrar actas de contrato por el id del contrato
  const filteredActasContratoById = actasContrato.filter(actaContrato => actaContrato.contratoId === selectedContratoId)

  // Filtrar actas de contrato por la palabra a buscar
  const filteredActasContrato = filteredActasContratoById.filter(actaContrato => {
    return (
      contratos.find((contrato) => contrato.id === actaContrato.contratoId)?.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actaContrato.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actaContrato.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actaContrato.documento?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Aplicar paginación a los datos
  const applyPagination = (data: ActaContrato[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a las actas de contrato filtradas
  const shownActasContrato = applyPagination(filteredActasContrato)

  return (
    <>
      {/* Listado de Actas de Contrato */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Actas de Contrato
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
              setEditedActaContrato({ ...defaultActaContrato, contratoId: selectedContratoId });
              setModalType('create');
            }}>
              <KTIcon iconName="plus" className="fs-3" /> Agregar
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="card-body pb-0">
          <div className="table-responsive">
            {/* Table */}
            <table className="table align-middle gs-0 gy-3">
              {/* Table Head */}
              <thead>
                <tr className='fw-semibold text-muted bg-light fs-6'>
                  <th className='min-w-150px rounded-start ps-5'>Acta de Contrato</th>
                  <th className='min-w-150px'>Descripción</th>
                  <th className='min-w-150px'>Documento</th>
                  <th className='min-w-150px text-end rounded-end pe-5'>Acciones</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {shownActasContrato.map((actaContrato) => (
                  <tr key={actaContrato.id}>
                    {/* <td className="d-flex flex-column gap-1 ps-5"> */}
                    <td className="ps-5">
                      <span className="fs-6 fw-bold">{actaContrato.nombre}</span>
                      {/* <span className="text-muted fs-7">
                        {contratos.find((contrato) => contrato.id === actaContrato.contratoId)?.nombre}
                      </span> */}
                    </td>
                    <td>
                      <span className="d-block fs-7 min-w-200px">{actaContrato.descripcion}</span>
                    </td>
                    <td>
                      <button className="btn btn-light-primary d-flex align-items-center gap-1 fs-7">
                        <KTIcon iconName="file" className="fs-3" />
                        {actaContrato.documento || 'Sin documento'}
                      </button>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchActaContrato(actaContrato.id)}>
                        <KTIcon iconName="pencil" className="fs-3" />
                      </button>
                      <button className="btn btn-icon btn-bg-light btn-active-light-danger ms-3" onClick={() => openDeleteModal(actaContrato.id)}>
                        <KTIcon iconName="trash" className="fs-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        <Pagination
          filteredItems={filteredActasContrato}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Acta de Contrato */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Acta de Contrato" : "Editar Acta de Contrato"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                <div className="form-group">
                  <label className="form-label required"> Contrato </label>
                  <select
                    value={editedActaContrato.contratoId}
                    onChange={(e) => setEditedActaContrato(prev => ({ ...prev, contratoId: parseInt(e.target.value) }))}
                    className="form-select"
                    disabled={selectedContratoId !== 0}
                    required
                  >
                    {selectedContratoId !== 0 ? (
                      <option value={selectedContratoId}>
                        {contratos.find(c => c.id === selectedContratoId)?.numero || 'Cargando...'}
                      </option>
                    ) : (
                      <>
                        <option value={0}>Seleccionar Contrato</option>
                        {contratos.map((contrato) => (
                          <option key={contrato.id} value={contrato.id}>{contrato.numero}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required"> Nombre </label>
                  <input
                    type="text"
                    placeholder="Nombre del acta"
                    value={editedActaContrato.nombre}
                    onChange={(e) => setEditedActaContrato(prev => ({ ...prev, nombre: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required"> Descripción </label>
                  <input
                    type="text"
                    placeholder="Descripción breve del acta"
                    value={editedActaContrato.descripcion}
                    onChange={(e) => setEditedActaContrato(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"> Documento </label>
                  {modalType === 'edit' && editedActaContrato.documento && (
                    <div className="mb-2">
                      <span className="badge badge-light-info me-2">Actual:</span>
                      <span>{editedActaContrato.documento || 'Sin documento'}</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditedActaContrato(prev => ({ ...prev, documento: e.target.files![0].name }));
                      }
                    }}
                    className="form-control"
                  />
                  <div className="text-muted fs-7 mt-1">Seleccione un archivo PDF.</div>
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createActaContrato(editedActaContrato);
              } else {
                updateActaContrato(editedActaContrato);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Caja de Confirmación de Eliminación de Acta de Contrato */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content={`¿Está seguro que desea eliminar el acta ${actasContrato.find(a => a.id === deleteActaContratoId)?.nombre}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteActaContrato}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}