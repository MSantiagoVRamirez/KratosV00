import { useState, useEffect } from "react"
import { AccionCierre } from "../../interfaces/talleres-hallazgos/AccionCierre"
import { Hallazgo } from "../../interfaces/talleres-hallazgos/Hallazgo"
import accionCierreService from "../../services/talleres-hallazgos/accionCierreService"
import hallazgoService from "../../services/talleres-hallazgos/hallazgoService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation';

export function AccionesCierreWidget({ selectedHallazgoId, onUpdate }: { selectedHallazgoId: number, onUpdate?: () => void }) {

  const defaultAccionCierre: AccionCierre = {
    id: 0,
    hallazgoId: selectedHallazgoId,
    fechaEnvioAccion: new Date().toISOString().split('T')[0],
    comentarioResponsableAccion: '',
    documentoResponsableAccion: null,
    fechaEnvioVerificacion: new Date().toISOString().split('T')[0],
    estaVerificado: false,
    comentarioResponsableVerificacion: '',
    enlace: null
  }
  const [accionesCierre, setAccionesCierre] = useState<AccionCierre[]>([])
  const [editedAccionCierre, setEditedAccionCierre] = useState<AccionCierre>(defaultAccionCierre)
  const [deleteAccionCierreId, setDeleteAccionCierreId] = useState<number>(defaultAccionCierre.id)

  const [hallazgos, setHallazgos] = useState<Hallazgo[]>([])

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create-accion' | 'edit-accion' | 'create-verificacion' | 'edit-verificacion' | 'delete' | null>(null)

  // Palabra a buscar en el listado de acciones de cierre
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

  // Validación del formulario de acción
  const isAccionFormValid = useFormValidation({
    fechaEnvioAccion: { value: editedAccionCierre.fechaEnvioAccion, required: true, type: 'date' },
    comentarioResponsableAccion: { value: editedAccionCierre.comentarioResponsableAccion, required: true, type: 'string' }
  });

  // Validación del formulario de verificación
  const isVerificacionFormValid = useFormValidation({
    fechaEnvioVerificacion: { value: editedAccionCierre.fechaEnvioVerificacion, required: true, type: 'date' },
    comentarioResponsableVerificacion: { value: editedAccionCierre.comentarioResponsableVerificacion, required: true, type: 'string' }
  });

  // Obtener todos los hallazgos
  const fetchHallazgos = () => {
    hallazgoService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setHallazgos(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los hallazgos", error)
      })
  }

  // Obtener todas las acciones de cierre
  const fetchAccionesCierre = () => {
    accionCierreService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setAccionesCierre(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las acciones de cierre", error)
      })
  }

  // Obtener todas las acciones de cierre cada vez que se renderiza el componente
  useEffect(() => {
    fetchHallazgos()
    fetchAccionesCierre()
  }, []) // Se remueve groupedAccionesCierre de las dependencias para evitar bucle infinito

  // Obtener una sola acción de cierre (para editar)
  const fetchAccionCierre = (id: number) => {
    accionCierreService.get(id)
      .then((response) => {
        setEditedAccionCierre(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener la acción de cierre", error)
      })
  }

  // Crear una acción de cierre
  const createAccionCierre = (data: AccionCierre) => {
    accionCierreService.create(data)
      .then(() => {
        setEditedAccionCierre(defaultAccionCierre) // Resetear el estado unificado
        closeModal()
        fetchAccionesCierre()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al crear la acción de cierre", error)
        alert(`Error al crear acción de cierre: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar una acción de cierre
  const updateAccionCierre = (data: AccionCierre) => {
    accionCierreService.update(data)
      .then(() => {
        setEditedAccionCierre(defaultAccionCierre) // Resetear el estado unificado
        closeModal()
        fetchAccionesCierre()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar la acción de cierre", error)
        alert(`Error al actualizar acción de cierre: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar una acción de cierre
  const deleteAccionCierre = () => {
    accionCierreService.remove(deleteAccionCierreId)
      .then(() => {
        setDeleteAccionCierreId(defaultAccionCierre.id)
        closeModal()
        fetchAccionesCierre()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar la acción de cierre", error)
        alert(`Error al eliminar acción de cierre: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteAccionCierreId(id)
    setModalType('delete')
  }

  // Filtrar acciones de cierre por el ID del hallazgo seleccionado
  const filteredAccionesCierreByHallazgo = selectedHallazgoId !== 0 ? accionesCierre.filter(accionCierre => accionCierre.hallazgoId === selectedHallazgoId) : accionesCierre

  // Filtrar acciones de cierre por la palabra a buscar
  const filteredAccionesCierre = filteredAccionesCierreByHallazgo.filter(accionCierre => {
    const fechaEnvioVerificacion = accionCierre.fechaEnvioVerificacion ? new Date(accionCierre.fechaEnvioVerificacion).toLocaleDateString().toLowerCase() : ''
    const fechaVerificado = accionCierre.fechaEnvioVerificacion ? new Date(accionCierre.fechaEnvioVerificacion).toLocaleDateString().toLowerCase() : ''

    return (
      hallazgos.find(hallazgo => hallazgo.id === accionCierre.hallazgoId)?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fechaEnvioVerificacion.includes(searchTerm) ||
      accionCierre.comentarioResponsableAccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accionCierre.documentoResponsableAccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fechaVerificado.includes(searchTerm) ||
      (accionCierre.estaVerificado ? 'Aprobado' : 'Rechazado').toLowerCase().includes(searchTerm.toLowerCase()) ||
      accionCierre.comentarioResponsableVerificacion?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Aplicar paginación a los datos
  const applyPagination = (data: AccionCierre[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a las acciones de cierre filtradas
  const shownAccionesCierre = applyPagination(filteredAccionesCierre)

  return (
    <>
      {/* Listado de Acciones de Cierre */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Acciones de Cierre
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
            {shownAccionesCierre.length == 0 && (
              <button
                className="btn btn-sm btn-light-primary btn-active-primary d-flex align-items-center gap-2"
                onClick={() => {
                  setEditedAccionCierre(defaultAccionCierre); // Resetear para nueva acción
                  setModalType('create-accion');
                }}
                style={{ textWrap: 'nowrap' }}
              >
                <KTIcon iconName="plus" className="fs-3" /> Agregar Acción
              </button>
            )}
            {/* TODO: Que el botón de agregar verificación se active solo si la última verificación no está aprobada */}
            <button
              className="btn btn-sm btn-light-primary btn-active-primary d-flex align-items-center gap-2"
              onClick={() => {
                if (shownAccionesCierre.length > 0) {
                  // Obtener la acción base para pre-rellenar datos
                  accionCierreService.get(shownAccionesCierre[0].id)
                    .then(response => {
                      const baseAction = response.data;
                      // Crear el objeto para la nueva verificación basado en la acción existente
                      const newVerificationData: AccionCierre = {
                        ...defaultAccionCierre, // Empezar con defaults (nuevo ID=0, fechas actuales etc.)
                        hallazgoId: baseAction.hallazgoId,
                        fechaEnvioAccion: baseAction.fechaEnvioAccion,
                        comentarioResponsableAccion: baseAction.comentarioResponsableAccion,
                        documentoResponsableAccion: baseAction.documentoResponsableAccion,
                        enlace: baseAction.enlace,
                        // Resetear campos específicos de verificación para la nueva entrada
                        fechaEnvioVerificacion: new Date().toISOString().split('T')[0],
                        estaVerificado: false,
                        comentarioResponsableVerificacion: '',
                      };
                      setEditedAccionCierre(newVerificationData); // Usar el estado unificado
                      setModalType('create-verificacion');
                    })
                    .catch(error => console.error("Error fetching base action for verification", error));
                }
              }}
              style={{ textWrap: 'nowrap' }}>
              <KTIcon iconName="check" className="fs-3" /> Agregar Verificación
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
                  <th className='min-w-100px rounded-start ps-5'>Hallazgo</th>
                  <th className='min-w-100px'>Fecha Envío<br />Acción</th>
                  <th className='min-w-150px'>Comentario Responsable Acción</th>
                  <th className='min-w-150px'>Documento Asociado</th>
                  <th className='min-w-150px'>Enlace Asociado</th>
                  <th className='min-w-100px'>Fecha Envío<br />Verificación</th>
                  <th className='min-w-100px'>Estado</th>
                  <th className='min-w-150px'>Comentario Responsable Verificación</th>
                  <th className='min-w-250px text-end rounded-end pe-5'>Acciones</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {shownAccionesCierre.map((accionCierre) => (
                  <tr key={accionCierre.id}>
                    {/* <td>
                      <span className="fw-bold fs-6 ps-5">
                        {hallazgos.find(hallazgo => hallazgo.id === accionCierre.hallazgoId)?.nombre}
                      </span>
                    </td> */}
                    {accionCierre.id === shownAccionesCierre[0].id && (
                      <td rowSpan={shownAccionesCierre.length}>
                        <span className="fw-bold fs-6 ps-5">
                          {hallazgos.find(hallazgo => hallazgo.id === accionCierre.hallazgoId)?.nombre}
                        </span>
                      </td>
                    )}
                    {accionCierre.id === shownAccionesCierre[0].id && (
                      <td rowSpan={shownAccionesCierre.length}>
                        <span className="badge badge-light fs-7" style={{ width: 'fit-content' }}>
                          {accionCierre.fechaEnvioVerificacion ? new Date(accionCierre.fechaEnvioVerificacion).toLocaleDateString() : ''}
                        </span>
                      </td>
                    )}
                    {accionCierre.id === shownAccionesCierre[0].id && (
                      <td rowSpan={shownAccionesCierre.length}>
                        <span className="d-block fw-light fs-8">
                          {accionCierre.comentarioResponsableAccion}
                        </span>
                      </td>
                    )}
                    {accionCierre.id === shownAccionesCierre[0].id && (
                      <td rowSpan={shownAccionesCierre.length}>
                        <button className="btn btn-light-primary d-flex align-items-center gap-1 fs-7">
                          <KTIcon iconName="file" className="fs-3" />
                          {accionCierre.documentoResponsableAccion}
                        </button>
                      </td>
                    )}
                    {accionCierre.id === shownAccionesCierre[0].id && (
                      <td rowSpan={shownAccionesCierre.length}>
                        <a href={accionCierre.enlace || ''} target="_blank" className="btn btn-light-primary d-flex align-items-center gap-1 fs-7">
                          <KTIcon iconName="link" className="fs-3" />
                          {accionCierre.enlace}
                        </a>
                      </td>
                    )}
                    <td>
                      <span className="badge badge-light fs-7" style={{ width: 'fit-content' }}>
                        {accionCierre.fechaEnvioVerificacion ? new Date(accionCierre.fechaEnvioVerificacion).toLocaleDateString() : ''}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-light-${accionCierre.estaVerificado ? 'success' : 'danger'}`}>
                        {accionCierre.estaVerificado ? 'Aprobada' : 'Rechazada'}
                      </span>
                    </td>
                    <td>
                      <span className="d-block fw-light fs-8">
                        {accionCierre.comentarioResponsableVerificacion}
                      </span>
                    </td>
                    <td className="text-end pe-5">
                      <button className="btn btn-icon btn-bg-light btn-active-light-primary me-2"
                        onClick={() => { fetchAccionCierre(accionCierre.id); setModalType('edit-accion'); }}>
                        <KTIcon iconName="pencil" className="fs-3" />
                      </button>
                      <button className="btn btn-icon btn-bg-light btn-active-light-primary me-2"
                        onClick={() => { fetchAccionCierre(accionCierre.id); setModalType('edit-verificacion'); }}>
                        <KTIcon iconName="check" className="fs-3" />
                      </button>
                      <button className="btn btn-icon btn-bg-light btn-active-light-danger" onClick={() => openDeleteModal(accionCierre.id)}>
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
          filteredItems={filteredAccionesCierre}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario de Creación de Acción de Cierre */}
        {modalType === 'create-accion' && (
          <ModalDialog
            title="Agregar Nueva Acción de Cierre"
            isFormValid={isAccionFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                <div className="form-group">
                  <label className="form-label required">Hallazgo</label>
                  <select
                    value={editedAccionCierre.hallazgoId}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, hallazgoId: parseInt(e.target.value) })}
                    className="form-select"
                    disabled={selectedHallazgoId !== 0} // Deshabilitar si hay un hallazgo seleccionado
                    required
                  >
                    <option value="">Seleccione un hallazgo</option>
                    {hallazgos.map((hallazgo) => (
                      <option key={hallazgo.id} value={hallazgo.id}>
                        {hallazgo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Fecha de Envío de la Acción</label>
                  <input
                    type="date"
                    value={editedAccionCierre.fechaEnvioAccion || ''}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, fechaEnvioAccion: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Comentario</label>
                  <textarea
                    value={editedAccionCierre.comentarioResponsableAccion || ''}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, comentarioResponsableAccion: e.target.value })}
                    className="form-control"
                    rows={3}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"> Documento Asociado </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditedAccionCierre({ ...editedAccionCierre, documentoResponsableAccion: e.target.files[0].name });  // Se almacena solo a ruta a el archivo
                        // Si necesitas el archivo en sí para subirlo, podrías guardarlo en otro estado
                      }
                    }}
                    className="form-control"
                  />
                  <div className="text-muted fs-7 mt-1">Seleccione un archivo PDF.</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Enlace</label>
                  <input
                    type="text"
                    value={editedAccionCierre.enlace || ''}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, enlace: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => createAccionCierre(editedAccionCierre)}
            closeModal={closeModal}
          />
        )}

        {/* Formulario de Creación de Verificación de Acción de Cierre */}
        {modalType === 'create-verificacion' && (
          <ModalDialog
            title="Agregar Nueva Verificación de Acción de Cierre"
            isFormValid={isVerificacionFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                {/* Campos de la acción base (deshabilitados) */}
                <div className="form-group">
                  <label className="form-label required">Hallazgo</label>
                  <select
                    value={editedAccionCierre.hallazgoId}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, hallazgoId: parseInt(e.target.value) })}
                    className="form-select"
                    disabled={true}
                    required
                  >
                    <option value="">Seleccione un hallazgo</option>
                    {hallazgos.map((hallazgo) => (
                      <option key={hallazgo.id} value={hallazgo.id}>
                        {hallazgo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Fecha de Envío de la Acción</label>
                  <input
                    type="date"
                    value={editedAccionCierre.fechaEnvioAccion ? new Date(editedAccionCierre.fechaEnvioAccion).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, fechaEnvioAccion: e.target.value })}
                    className="form-control"
                    disabled={true}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Comentario</label>
                  <textarea
                    value={editedAccionCierre.comentarioResponsableAccion}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, comentarioResponsableAccion: e.target.value })}
                    className="form-control"
                    rows={3}
                    disabled={true}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"> Documento Asociado </label>
                  {editedAccionCierre.documentoResponsableAccion && <span className="form-control disabled">{editedAccionCierre.documentoResponsableAccion}</span>}
                  <input
                    type="file"
                    accept=".pdf"
                    className="form-control mt-2"
                    disabled={true}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Enlace</label>
                  <input
                    type="text"
                    value={editedAccionCierre.enlace || ''}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, enlace: e.target.value })}
                    className="form-control"
                    disabled={true}
                  />
                </div>
                {/* Campos de la nueva verificación (habilitados) */}
                <div className="form-group">
                  <label className="form-label required">Fecha de Envío de Verificación</label>
                  <input
                    type="date"
                    value={editedAccionCierre.fechaEnvioVerificacion || ''}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, fechaEnvioVerificacion: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado de Verificación</label>
                  <select
                    value={editedAccionCierre.estaVerificado ? 'true' : 'false'}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, estaVerificado: e.target.value === 'true' })}
                    className="form-select"
                  >
                    <option value="true">Aprobado</option>
                    <option value="false">Pendiente</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Comentario de Verificación</label>
                  <textarea
                    value={editedAccionCierre.comentarioResponsableVerificacion || ''}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, comentarioResponsableVerificacion: e.target.value })}
                    className="form-control"
                    rows={3}
                    required
                  />
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => createAccionCierre(editedAccionCierre)}
            closeModal={closeModal}
          />
        )}

        {/* Formulario de Edición de Acción de Cierre */}
        {modalType === 'edit-accion' && (
          <ModalDialog
            title="Editar Acción de Cierre"
            isFormValid={isAccionFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                {/* Campos existentes que se pueden editar */}
                <div className="form-group">
                  <label className="form-label required">Hallazgo</label>
                  <select
                    value={editedAccionCierre.hallazgoId}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, hallazgoId: parseInt(e.target.value) })}
                    className="form-select"
                    disabled={true} // No se debería poder cambiar el hallazgo asociado a una acción existente
                    required
                  >
                    <option value="">Seleccione un hallazgo</option>
                    {hallazgos.map((hallazgo) => (
                      <option key={hallazgo.id} value={hallazgo.id}>
                        {hallazgo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Fecha de Envío de la Acción</label>
                  <input
                    type="date"
                    value={editedAccionCierre.fechaEnvioAccion ? new Date(editedAccionCierre.fechaEnvioAccion).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, fechaEnvioAccion: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Comentario de la Acción</label>
                  <textarea
                    value={editedAccionCierre.comentarioResponsableAccion}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, comentarioResponsableAccion: e.target.value })}
                    className="form-control"
                    rows={3}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"> Documento Asociado </label>
                  <div className="mb-2">
                    <span className="badge badge-light-info me-2">Actual:</span>
                    <span>{editedAccionCierre.documentoResponsableAccion || 'Sin documento'}</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditedAccionCierre({ ...editedAccionCierre, documentoResponsableAccion: e.target.files[0].name }); // Actualiza el estado unificado
                      }
                    }}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Enlace</label>
                  <input
                    type="text"
                    value={editedAccionCierre.enlace || ''}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, enlace: e.target.value })}
                    className="form-control"
                  />
                </div>
                {/* Campos de verificación NO se editan aquí */}
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => updateAccionCierre(editedAccionCierre)}
            closeModal={closeModal}
          />
        )}

        {/* Formulario de Verificación de Acción de Cierre (Editar Verificación Existente) */}
        {modalType === 'edit-verificacion' && (
          <ModalDialog
            title="Editar Verificación de Acción de Cierre"
            isFormValid={isVerificacionFormValid}
            content={
              <div className="d-flex flex-column gap-3">
                {/* Campos de la acción base (deshabilitados) */}
                <div className="form-group">
                  <label className="form-label required">Hallazgo</label>
                  <select
                    value={editedAccionCierre.hallazgoId}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, hallazgoId: parseInt(e.target.value) })}
                    className="form-select"
                    disabled={true}
                    required
                  >
                    <option value="">Seleccione un hallazgo</option>
                    {hallazgos.map((hallazgo) => (
                      <option key={hallazgo.id} value={hallazgo.id}>
                        {hallazgo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Fecha de Envío de la Acción</label>
                  <input
                    type="date"
                    value={editedAccionCierre.fechaEnvioAccion ? new Date(editedAccionCierre.fechaEnvioAccion).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, fechaEnvioAccion: e.target.value })}
                    className="form-control"
                    disabled={true}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Comentario de la Acción</label>
                  <textarea
                    value={editedAccionCierre.comentarioResponsableAccion}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, comentarioResponsableAccion: e.target.value })}
                    className="form-control"
                    rows={3}
                    disabled={true}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required"> Documento Asociado </label>
                  <div className="mb-2">
                    <span className="badge badge-light-info me-2">Actual:</span>
                    <span>{editedAccionCierre.documentoResponsableAccion || 'Sin documento'}</span>
                  </div>
                  <input type="file" className="form-control mt-2" disabled={true} />
                </div>
                <div className="form-group">
                  <label className="form-label">Enlace</label>
                  <input
                    type="text"
                    value={editedAccionCierre.enlace || ''}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, enlace: e.target.value })}
                    className="form-control"
                    disabled={true}
                  />
                </div>
                {/* Campos de la verificación (habilitados para edición) */}
                <div className="form-group">
                  <label className="form-label required">Fecha de Envío de Verificación</label>
                  <input
                    type="date"
                    value={editedAccionCierre.fechaEnvioVerificacion ? new Date(editedAccionCierre.fechaEnvioVerificacion).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, fechaEnvioVerificacion: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado de Verificación</label>
                  <select
                    value={editedAccionCierre.estaVerificado ? 'true' : 'false'}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, estaVerificado: e.target.value === 'true' })}
                    className="form-select"
                  >
                    <option value="true">Aprobado</option>
                    <option value="false">Pendiente</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Comentario de Verificación</label>
                  <textarea
                    value={editedAccionCierre.comentarioResponsableVerificacion || ''}
                    onChange={(e) => setEditedAccionCierre({ ...editedAccionCierre, comentarioResponsableVerificacion: e.target.value })}
                    className="form-control"
                    rows={3}
                    required
                  />
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => updateAccionCierre(editedAccionCierre)}
            closeModal={closeModal}
          />
        )}

        {/* Confirmar Eliminación */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Eliminar Acción de Cierre"
            content="¿Estás seguro de que deseas eliminar esta acción de cierre?"
            textBtn="Eliminar"
            onConfirm={deleteAccionCierre}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}