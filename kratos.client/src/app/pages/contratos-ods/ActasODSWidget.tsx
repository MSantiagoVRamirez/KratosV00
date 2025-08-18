import { useState, useEffect } from "react"
import { ActaODS } from "../../interfaces/contratos-ods/ActaODS"
import { ODS } from "../../interfaces/contratos-ods/ODS"
import actaOdsService from "../../services/contratos-ods/actaOdsService"
import odsService from "../../services/contratos-ods/odsService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation';

export function ActasODSWidget({ selectedODSId, onUpdate }: { selectedODSId: number, onUpdate?: () => void }) {

  const defaultActaODS: ActaODS = {
    id: 0,
    odsId: selectedODSId,
    nombre: '',
    descripcion: '',
    documento: null
  }
  const [actasODS, setActasODS] = useState<ActaODS[]>([])
  const [editedActaODS, setEditedActaODS] = useState<ActaODS>(defaultActaODS)
  const [deleteActaContratoId, setDeleteActaODSId] = useState<number>(defaultActaODS.id)

  const [ordenesServicio, setOrdenesServicio] = useState<ODS[]>([])

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
    odsId: { value: editedActaODS.odsId, required: true },
    nombre: { value: editedActaODS.nombre, required: true },
    descripcion: { value: editedActaODS.descripcion, required: true },
  });

  // Obtener todas las ODS
  const fetchODS = () => {
    odsService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setOrdenesServicio(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las ODS", error)
      })
  }

  // Obtener todas las actas de ODS
  const fetchActasODS = () => {
    actaOdsService
      .getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setActasODS(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las actas de ODS", error)
      })
  }

  // Obtener todas las actas de ODS cada vez que se renderiza el componente
  useEffect(() => {
    fetchODS()  // Obtener todas las ODS
    fetchActasODS()  // Obtener todas las actas de ODS
  }, [])

  // Obtener una sola acta de ODS (para editar)
  const fetchActaODS = (id: number) => {
    actaOdsService
      .get(id)
      .then((response) => {
        setEditedActaODS(response.data)  // Llenar el estado unificado
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el acta de ODS", error)
      })
  }

  // Crear un acta de ODS
  const createActaODS = (data: ActaODS) => {
    // Asegurar odsId si viene de prop
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    actaOdsService
      .create(dataToSend)
      .then(() => {
        setEditedActaODS(defaultActaODS) // Resetear estado unificado
        alert("Acta de ODS creada exitosamente")
        closeModal()  // Ocultar el formulario
        fetchActasODS()  // Actualizar la lista de actas de ODS
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al crear el acta de ODS", error)
        alert(`Error al crear acta de ODS: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar un acta de ODS
  const updateActaODS = (data: ActaODS) => {
    // Asegurar odsId
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    actaOdsService
      .update(dataToSend)
      .then(() => {
        setEditedActaODS(defaultActaODS) // Resetear estado unificado
        alert("Acta de ODS actualizada exitosamente")
        closeModal()  // Ocultar el formulario
        fetchActasODS()  // Actualizar la lista de actas de ODS
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el acta de ODS", error)
        alert(`Error al actualizar acta de ODS: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar un acta de ODS
  const deleteActaODS = () => {
    actaOdsService
      .remove(deleteActaContratoId)
      .then(() => {
        // Actualizar inmediatamente el estado local removiendo el elemento eliminado
        setActasODS(prevActasODS => 
          prevActasODS.filter(actaODS => actaODS.id !== deleteActaContratoId)
        )
        setDeleteActaODSId(defaultActaODS.id) // Limpiar el input de eliminación
        alert("Acta de ODS eliminada exitosamente")
        closeModal()  // Ocultar el formulario
        // También hacer fetch para asegurar sincronización con el servidor
        fetchActasODS()  // Actualizar la lista de actas de ODS
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el acta de ODS", error)
        alert(`Error al eliminar acta de ODS: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteActaODSId(id)
    setModalType('delete')
  }

  // Filtrar las actas de ODS por el id de la ODS
  const filteredActasODSByODS = actasODS.filter(actaODS => actaODS.odsId === selectedODSId)

  // Filtrar las actas de ODS por la palabra a buscar
  const filteredActasODS = filteredActasODSByODS.filter(actaODS => {
    return (
      actaODS.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actaODS.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actaODS.documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordenesServicio.find((ods) => ods.id === actaODS.odsId)?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Aplicar paginación a los datos
  const applyPagination = (data: ActaODS[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a las actas de ODS filtradas
  const shownActasODS = applyPagination(filteredActasODS)

  return (
    <>
      {/* Listado de Actas de ODS */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Actas de ODS
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
              // Resetear estado asegurando odsId
              setEditedActaODS({ ...defaultActaODS, odsId: selectedODSId || 0 });
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
                  <th className='min-w-150px rounded-start ps-5'>Acta de ODS</th>
                  <th className='min-w-150px'>Descripción</th>
                  <th className='min-w-150px'>Documento</th>
                  <th className='min-w-150px text-end rounded-end pe-5'>Acciones</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {shownActasODS.map((actaODS) => (
                  <tr key={actaODS.id}>
                    <td>
                      <span className="fs-6 fw-bold ps-5">{actaODS.nombre}</span>
                    </td>
                    {/* <td className="d-flex align-items-center gap-3">
                      <span className="bullet bullet-vertical h-40px bg-primary"></span>
                      <div className="d-flex justify-content-start flex-column">
                        <span className="fs-6 fw-bold mb-1">{actaODS.nombre}</span>
                        <span className="badge badge-light-primary fs-8">
                          {ordenesServicio.find((ods) => ods.id === actaODS.odsId)?.nombre}
                        </span>
                      </div>
                    </td> */}
                    <td>
                      <span className="d-block fs-7 min-w-200px">{actaODS.descripcion}</span>
                    </td>
                    <td>
                      <button className="btn btn-light-primary d-flex align-items-center gap-1 fs-7">
                        <KTIcon iconName="file" className="fs-3" />
                        {actaODS.documento || 'Sin documento'}
                      </button>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchActaODS(actaODS.id)}>
                        <KTIcon iconName="pencil" className="fs-3" />
                      </button>
                      <button className="btn btn-icon btn-bg-light btn-active-light-danger ms-3" onClick={() => openDeleteModal(actaODS.id)}>
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
          filteredItems={filteredActasODS}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Acta de ODS */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Acta de ODS" : "Editar Acta de ODS"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                {/* --- Campos del Formulario usando editedActaODS --- */}
                <div className="form-group">
                  <label className="form-label required"> ODS </label>
                  <select
                    value={editedActaODS.odsId}
                    onChange={(e) => setEditedActaODS(prev => ({ ...prev, odsId: parseInt(e.target.value) }))}
                    className="form-select"
                    disabled={selectedODSId !== 0} // Deshabilitar si viene de prop
                    required
                  >
                    {selectedODSId !== 0 ? (
                      <option value={selectedODSId}>
                        {ordenesServicio.find(ods => ods.id === selectedODSId)?.nombre || 'Cargando...'}
                      </option>
                    ) : (
                      <>
                        <option value="">Seleccionar ODS</option>
                        {ordenesServicio.map((ods) => (
                          <option key={ods.id} value={ods.id}>
                            {ods.nombre}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required"> Nombre </label>
                  <input
                    type="text"
                    value={editedActaODS.nombre}
                    onChange={(e) => setEditedActaODS(prev => ({ ...prev, nombre: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required"> Descripción </label>
                  <textarea // Usar textarea para descripciones más largas
                    value={editedActaODS.descripcion}
                    onChange={(e) => setEditedActaODS(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="form-control"
                    rows={3} // Ajustar según necesidad
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"> Documento </label>
                  {modalType === 'edit' && editedActaODS.documento && (
                    <div className="mb-2">
                      <span className="badge badge-light-info me-2">Actual:</span>
                      <span>{editedActaODS.documento || 'Sin documento'}</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditedActaODS(prev => ({ ...prev, documento: e.target.files![0].name }));
                        // Considerar almacenar el File object si es necesario para la subida
                        // setFileToUpload(e.target.files[0]);
                      }
                    }}
                    className="form-control"
                  />
                  <div className="text-muted fs-7 mt-1">Seleccione un archivo PDF.</div>
                </div>
                {/* --- Fin Campos del Formulario --- */}
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createActaODS(editedActaODS);
              } else {
                updateActaODS(editedActaODS);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Caja de Confirmación de Eliminación de Acta de ODS */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Eliminar Acta de ODS"
            content={`¿Estás seguro de que deseas eliminar el acta "${actasODS.find(a => a.id === deleteActaContratoId)?.nombre}"?`} // Mensaje mejorado
            textBtn="Eliminar"
            confirmButtonClass="btn-danger" // Botón rojo
            onConfirm={deleteActaODS}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}