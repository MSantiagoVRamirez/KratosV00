import { useState, useEffect } from "react"
import { DocumentoODS } from "../../interfaces/secs/DocumentoODS"
import { ODS } from "../../interfaces/contratos-ods/ODS"
import documentoODSService from "../../services/secs/documentoODSService"
import odsService from "../../services/contratos-ods/odsService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAuth } from "../../modules/auth/AuthContext"

export function DocumentosODSWidget({ selectedODSId, onUpdate }: { selectedODSId: number, onUpdate?: () => void }) {

  const { role } = useAuth();
  const currentRole = role || '';
  const esOriginador = currentRole === 'Administrador' || currentRole === 'Funcionario Contratista';
  const esAprobador = currentRole === 'Administrador' || currentRole === 'Funcionario Cenit';

  const defaultDocumentoODS: DocumentoODS = {
    id: 0,
    odsId: selectedODSId,
    fecha: new Date().toISOString().split('T')[0],
    informeSemanalPlaneado: 0,
    informeSemanalReal: 0,
    informeMensualPlaneado: 0,
    informeMensualReal: 0,
    informeEstimadoPlaneado: 0,
    informeEstimadoReal: 0,
    informeHSEEstadísticoPlaneado: 0,
    informeHSEEstadísticoReal: 0,
    informeHSEGestionPlaneado: 0,
    informeHSEGestionReal: 0,
    actaInicioPlaneado: 0,
    actaInicioReal: 0,
    actaOCPlaneado: 0,
    actaOCReal: 0,
    actaSuspensionReinicioPaneado: 0,
    actaSuspensionReinicioRea: 0,
    actaTerminacionPlaneado: 0,
    actaTerminacionReal: 0,
    actaBalanceCierrePlaneado: 0,
    actaBalanceCierreReal: 0,
    totalPlaneado: 0,
    totalReal: 0
  }
  
  const [documentosODS, setDocumentosODS] = useState<DocumentoODS[]>([])
  const [editedDocumentoODS, setEditedDocumentoODS] = useState<DocumentoODS>(defaultDocumentoODS)
  const [deleteDocumentoODSId, setDeleteDocumentoODSId] = useState<number>(defaultDocumentoODS.id)

  const [ordenesServicio, setOrdenesServicio] = useState<ODS[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const closeModal = () => setModalType(null)

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  }

  // Helper para manejar cambios numéricos
  const handleNumberChange = (fieldName: keyof DocumentoODS, value: string) => {
    const numericValue = value === '' ? 0 : parseInt(value) || 0;
    setEditedDocumentoODS(prev => ({
      ...prev,
      [fieldName]: numericValue
    }));
  };

  // Validación del formulario
  const isFormValid = useFormValidation({
    odsId: { value: editedDocumentoODS.odsId, required: true, type: 'number' },
    fecha: { value: editedDocumentoODS.fecha, required: true, type: 'string' },
    informeSemanalPlaneado: { value: editedDocumentoODS.informeSemanalPlaneado, required: false, type: 'number' },
    informeSemanalReal: { value: editedDocumentoODS.informeSemanalReal, required: false, type: 'number' },
    informeMensualPlaneado: { value: editedDocumentoODS.informeMensualPlaneado, required: false, type: 'number' },
    informeMensualReal: { value: editedDocumentoODS.informeMensualReal, required: false, type: 'number' },
  });

  const fetchOrdenesServicio = () => {
    odsService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setOrdenesServicio(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las órdenes de servicio", error)
      })
  }

  const fetchDocumentosODS = () => {
    documentoODSService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setDocumentosODS(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los documentos ODS", error)
      })
  }

  useEffect(() => {
    fetchOrdenesServicio()
    fetchDocumentosODS()
  }, [selectedODSId])

  useEffect(() => {
    setEditedDocumentoODS({
      ...defaultDocumentoODS,
      odsId: selectedODSId || 0
    });
  }, [selectedODSId]);

  const fetchDocumentoODS = (id: number) => {
    documentoODSService.get(id)
      .then((response) => {
        setEditedDocumentoODS(response.data)
        setModalType('edit')
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el documento ODS", error)
      })
  }

  const createDocumentoODS = (data: DocumentoODS) => {
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    documentoODSService.create(dataToSend)
      .then(() => {
        setEditedDocumentoODS(defaultDocumentoODS)
        alert("Documento ODS creado exitosamente")
        closeModal()
        fetchDocumentosODS()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al crear el documento ODS", error)
        alert(`Error al crear documento ODS: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const updateDocumentoODS = (data: DocumentoODS) => {
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    documentoODSService.update(dataToSend)
      .then(() => {
        setEditedDocumentoODS(defaultDocumentoODS)
        alert("Documento ODS actualizado exitosamente")
        closeModal()
        fetchDocumentosODS()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el documento ODS", error)
        alert(`Error al actualizar documento ODS: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const deleteDocumentoODS = () => {
    documentoODSService.remove(deleteDocumentoODSId)
      .then(() => {
        setDeleteDocumentoODSId(defaultDocumentoODS.id)
        alert("Documento ODS eliminado exitosamente")
        closeModal()
        fetchDocumentosODS()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el documento ODS", error)
        alert(`Error al eliminar documento ODS: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const openDeleteModal = (id: number) => {
    setDeleteDocumentoODSId(id)
    setModalType('delete')
  }

  const filteredDocumentosByODS = documentosODS.filter(documento => documento.odsId === selectedODSId)

  const filteredDocumentosODS = filteredDocumentosByODS.filter(documento => {
    const ods = ordenesServicio.find(o => o.id === documento.odsId);
    const searchTermLower = searchTerm.toLowerCase();
    const fechaStr = formatDate(documento.fecha);

    return (
      ods?.nombre.toLowerCase().includes(searchTermLower) ||
      fechaStr.toLowerCase().includes(searchTermLower) ||
      documento.totalPlaneado.toString().includes(searchTermLower) ||
      documento.totalReal.toString().includes(searchTermLower) ||
      documento.informeSemanalPlaneado.toString().includes(searchTermLower) ||
      documento.informeMensualPlaneado.toString().includes(searchTermLower)
    );
  })

  const applyPagination = (data: DocumentoODS[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  const shownDocumentosODS = applyPagination(filteredDocumentosODS)

  const getProgressPercentage = (real: number, planeado: number) => {
    if (planeado === 0) return 0;
    return Math.round((real / planeado) * 100);
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'success';
    if (percentage >= 80) return 'primary';
    if (percentage >= 60) return 'warning';
    return 'danger';
  }

  return (
    <>
      <div className="card mx-10 my-10 mx-0-sm">
        <div className="card-header">
          <div className="card-title fw-bold fs-2">Documentos ODS</div>
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
              setEditedDocumentoODS({
                ...defaultDocumentoODS,
                odsId: selectedODSId || 0,
              });
              setModalType('create');
            }}>
              <KTIcon iconName="plus" className="fs-3" /> Agregar
            </button>
          </div>
        </div>

        <div className="card-body pb-0">
          <div className="table-responsive">
            <table className="table align-middle gs-0 gy-3">
              <thead>
                <tr className='fw-semibold text-muted bg-light fs-6'>
                  <th className='min-w-150px rounded-start ps-5'>Fecha</th>
                  <th className='min-w-100px'>Total Planeado</th>
                  <th className='min-w-100px'>Total Real</th>
                  <th className='min-w-150px'>Progreso</th>
                  <th className='min-w-150px text-end rounded-end pe-5'>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shownDocumentosODS.map((documento) => {
                  const progressPercentage = getProgressPercentage(documento.totalReal, documento.totalPlaneado);
                  const progressColor = getProgressColor(progressPercentage);
                  return (
                    <tr key={documento.id}>
                      <td>
                        <span className="fs-6 fw-bold ps-5">
                          {formatDate(documento.fecha)}
                        </span>
                      </td>
                      <td>
                        <span className="fs-6 fw-bold text-primary">
                          {documento.totalPlaneado}
                        </span>
                      </td>
                      <td>
                        <span className="fs-6 fw-bold text-success">
                          {documento.totalReal}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <div className="progress h-8px w-100">
                            <div 
                              className={`progress-bar bg-${progressColor}`}
                              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="fs-7 text-muted mt-1">{progressPercentage}%</span>
                        </div>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchDocumentoODS(documento.id)}>
                          <KTIcon iconName="pencil" className="fs-3" />
                        </button>
                        <button className="btn btn-icon btn-bg-light btn-active-light-danger ms-3" onClick={() => openDeleteModal(documento.id)}>
                          <KTIcon iconName="trash" className="fs-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          filteredItems={filteredDocumentosODS}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Documento ODS" : "Editar Documento ODS"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-5" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label required">Orden de Servicio</label>
                  <select
                    value={editedDocumentoODS.odsId}
                    onChange={(e) => setEditedDocumentoODS(prev => ({ ...prev, odsId: parseInt(e.target.value) }))}
                    className="form-select"
                    disabled
                    required
                  >
                    {selectedODSId !== 0 ? (
                      <option value={selectedODSId}>
                        {ordenesServicio.find(ods => ods.id === selectedODSId)?.nombre || 'Cargando...'}
                      </option>
                    ) : (
                      <option value="">Seleccione una ODS</option>
                    )}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label required">Fecha</label>
                  <input
                    type="date"
                    value={editedDocumentoODS.fecha}
                    onChange={(e) => setEditedDocumentoODS(prev => ({ ...prev, fecha: e.target.value }))}
                    className="form-control"
                    disabled={!esOriginador}
                    required
                  />
                </div>

                {/* Sección de Informes */}
                <div className="separator border-2 my-3"></div>
                <h5 className="fw-bold text-dark">Informes</h5>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Informe Semanal Planeado</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.informeSemanalPlaneado}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, informeSemanalPlaneado: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esOriginador}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Informe Semanal Real</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.informeSemanalReal}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, informeSemanalReal: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esAprobador}
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Informe Mensual Planeado</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.informeMensualPlaneado}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, informeMensualPlaneado: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esOriginador}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Informe Mensual Real</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.informeMensualReal}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, informeMensualReal: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esAprobador}
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Informe Estimado Planeado</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.informeEstimadoPlaneado}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, informeEstimadoPlaneado: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esOriginador}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Informe Estimado Real</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.informeEstimadoReal}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, informeEstimadoReal: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esAprobador}
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Informe HSE Estadístico Planeado</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.informeHSEEstadísticoPlaneado}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, informeHSEEstadísticoPlaneado: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esOriginador}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Informe HSE Estadístico Real</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.informeHSEEstadísticoReal}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, informeHSEEstadísticoReal: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esAprobador}
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Informe HSE Gestión Planeado</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.informeHSEGestionPlaneado}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, informeHSEGestionPlaneado: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esOriginador}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Informe HSE Gestión Real</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.informeHSEGestionReal}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, informeHSEGestionReal: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esAprobador}
                    />
                  </div>
                </div>

                {/* Sección de Actas */}
                <div className="separator border-2 my-3"></div>
                <h5 className="fw-bold text-dark">Actas</h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Acta Inicio Planeado</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.actaInicioPlaneado}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, actaInicioPlaneado: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esOriginador}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Acta Inicio Real</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.actaInicioReal}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, actaInicioReal: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esAprobador}
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Acta OC Planeado</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.actaOCPlaneado}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, actaOCPlaneado: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esOriginador}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Acta OC Real</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.actaOCReal}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, actaOCReal: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esAprobador}
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Acta Suspensión/Reinicio Planeado</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.actaSuspensionReinicioPaneado}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, actaSuspensionReinicioPaneado: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esOriginador}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Acta Suspensión/Reinicio Real</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.actaSuspensionReinicioRea}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, actaSuspensionReinicioRea: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esAprobador}
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Acta Terminación Planeado</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.actaTerminacionPlaneado}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, actaTerminacionPlaneado: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esOriginador}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Acta Terminación Real</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.actaTerminacionReal}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, actaTerminacionReal: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esAprobador}
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Acta Balance/Cierre Planeado</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.actaBalanceCierrePlaneado}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, actaBalanceCierrePlaneado: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esOriginador}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Acta Balance/Cierre Real</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.actaBalanceCierreReal}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, actaBalanceCierreReal: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esAprobador}
                    />
                  </div>
                </div>

                {/* Sección de Totales */}
                <div className="separator border-2 my-3"></div>
                <h5 className="fw-bold text-dark">Totales</h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Total Planeado</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.totalPlaneado}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, totalPlaneado: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esOriginador}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Total Real</label>
                    <input
                      type="number"
                      min="0"
                      value={editedDocumentoODS.totalReal}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditedDocumentoODS(prev => ({ ...prev, totalReal: value }));
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto cuando se hace focus
                        e.target.select();
                      }}
                      onClick={(e) => {
                        // También seleccionar al hacer click para mejor UX
                        e.currentTarget.select();
                      }}
                      className="form-control"
                      disabled={!esAprobador}
                    />
                  </div>
                </div>

                {/* Información de progreso */}
                <div className="alert alert-info d-flex align-items-center p-5">
                  <KTIcon iconName="information-5" className="fs-2hx text-info me-4" />
                  <div className="d-flex flex-column">
                    <span className="fw-bold">Progreso: {getProgressPercentage(editedDocumentoODS.totalReal, editedDocumentoODS.totalPlaneado)}%</span>
                    <span className="fs-7">{editedDocumentoODS.totalReal} de {editedDocumentoODS.totalPlaneado} documentos completados</span>
                  </div>
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createDocumentoODS(editedDocumentoODS);
              } else {
                updateDocumentoODS(editedDocumentoODS);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {modalType === 'delete' && (
          <ModalDialog
            title="Eliminar Documento ODS"
            content="¿Estás seguro de que deseas eliminar este documento ODS? Esta acción no se puede deshacer."
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteDocumentoODS}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}