import { useState, useEffect } from "react"
import { NoConformidadODS } from "../../interfaces/secs/NoConformidadODS"
import { ODS } from "../../interfaces/contratos-ods/ODS"
import noConformidadODSService from "../../services/secs/noConformidadODSService"
import odsService from "../../services/contratos-ods/odsService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAuth } from "../../modules/auth/AuthContext"

export function NoConformidadesODSWidget({ selectedODSId, onUpdate }: { selectedODSId: number, onUpdate?: () => void }) {

  const { role } = useAuth();
  const currentRole = role || '';
  const esOriginador = currentRole === 'Administrador' || currentRole === 'Funcionario Contratista';
  const esAprobador = currentRole === 'Administrador' || currentRole === 'Funcionario Cenit';

  const defaultNoConformidadODS: NoConformidadODS = {
    id: 0,
    odsId: selectedODSId,
    fecha: new Date().toISOString().split('T')[0],
    cantidadTotal: 0,
    cantidadCerradas: 0,
    estaAprobado: false
  }
  
  const [noConformidadesODS, setNoConformidadesODS] = useState<NoConformidadODS[]>([])
  const [editedNoConformidadODS, setEditedNoConformidadODS] = useState<NoConformidadODS>(defaultNoConformidadODS)
  const [deleteNoConformidadODSId, setDeleteNoConformidadODSId] = useState<number>(defaultNoConformidadODS.id)

  const [ordenesServicio, setOrdenesServicio] = useState<ODS[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    odsId: { value: editedNoConformidadODS.odsId, required: true, type: 'number' },
    fecha: { value: editedNoConformidadODS.fecha, required: true, type: 'string' },
    cantidadTotal: { value: editedNoConformidadODS.cantidadTotal, required: true, type: 'number' },
    cantidadCerradas: { value: editedNoConformidadODS.cantidadCerradas, required: true, type: 'number' },
    estaAprobado: { value: editedNoConformidadODS.estaAprobado, required: false, type: 'boolean' },
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

  const fetchNoConformidadesODS = () => {
    noConformidadODSService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setNoConformidadesODS(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las no conformidades ODS", error)
      })
  }

  useEffect(() => {
    fetchOrdenesServicio()
    fetchNoConformidadesODS()
  }, [selectedODSId])

  useEffect(() => {
    setEditedNoConformidadODS({
      ...defaultNoConformidadODS,
      odsId: selectedODSId || 0
    });
  }, [selectedODSId]);

  const fetchNoConformidadODS = (id: number) => {
    noConformidadODSService.get(id)
      .then((response) => {
        setEditedNoConformidadODS(response.data)
        setModalType('edit')
      })
      .catch((error) => {
        console.error("Hubo un error al obtener la no conformidad ODS", error)
      })
  }

  const createNoConformidadODS = (data: NoConformidadODS) => {
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    noConformidadODSService.create(dataToSend)
      .then(() => {
        setEditedNoConformidadODS(defaultNoConformidadODS)
        alert("No conformidad ODS creada exitosamente")
        closeModal()
        fetchNoConformidadesODS()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al crear la no conformidad ODS", error)
        alert(`Error al crear no conformidad ODS: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const updateNoConformidadODS = (data: NoConformidadODS) => {
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    noConformidadODSService.update(dataToSend)
      .then(() => {
        setEditedNoConformidadODS(defaultNoConformidadODS)
        alert("No conformidad ODS actualizada exitosamente")
        closeModal()
        fetchNoConformidadesODS()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar la no conformidad ODS", error)
        alert(`Error al actualizar no conformidad ODS: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const deleteNoConformidadODS = () => {
    noConformidadODSService.remove(deleteNoConformidadODSId)
      .then(() => {
        setDeleteNoConformidadODSId(defaultNoConformidadODS.id)
        alert("No conformidad ODS eliminada exitosamente")
        closeModal()
        fetchNoConformidadesODS()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar la no conformidad ODS", error)
        alert(`Error al eliminar no conformidad ODS: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const openDeleteModal = (id: number) => {
    setDeleteNoConformidadODSId(id)
    setModalType('delete')
  }

  const filteredNoConformidadesByODS = noConformidadesODS.filter(noConformidad => noConformidad.odsId === selectedODSId)

  const filteredNoConformidadesODS = filteredNoConformidadesByODS.filter(noConformidad => {
    const ods = ordenesServicio.find(o => o.id === noConformidad.odsId);
    const searchTermLower = searchTerm.toLowerCase();

    return (
      ods?.nombre.toLowerCase().includes(searchTermLower) ||
      noConformidad.fecha.toLowerCase().includes(searchTermLower) ||
      noConformidad.cantidadTotal.toString().includes(searchTermLower) ||
      noConformidad.cantidadCerradas.toString().includes(searchTermLower)
    );
  })

  const applyPagination = (data: NoConformidadODS[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  const shownNoConformidadesODS = applyPagination(filteredNoConformidadesODS)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  }

  const getProgressPercentage = (cerradas: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((cerradas / total) * 100);
  }

  return (
    <>
      <div className="card mx-10 my-10 mx-0-sm">
        <div className="card-header">
          <div className="card-title fw-bold fs-2">No Conformidades ODS</div>
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
              setEditedNoConformidadODS({
                ...defaultNoConformidadODS,
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
                  <th className='min-w-100px rounded-start ps-5'>Fecha</th>
                  <th className='min-w-100px'>Total</th>
                  <th className='min-w-100px'>Cerradas</th>
                  <th className='min-w-150px'>Progreso</th>
                  <th className='min-w-100px'>Aprobado</th>
                  <th className='min-w-150px text-end rounded-end pe-5'>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shownNoConformidadesODS.map((noConformidad) => {
                  const progressPercentage = getProgressPercentage(noConformidad.cantidadCerradas, noConformidad.cantidadTotal);
                  return (
                    <tr key={noConformidad.id}>
                      <td>
                        <span className="fs-6 fw-bold ps-5">
                          {formatDate(noConformidad.fecha)}
                        </span>
                      </td>
                      <td>
                        <span className="fs-6 fw-bold text-primary">
                          {noConformidad.cantidadTotal}
                        </span>
                      </td>
                      <td>
                        <span className="fs-6 fw-bold text-success">
                          {noConformidad.cantidadCerradas}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <div className="progress h-8px w-100">
                            <div 
                              className={`progress-bar ${progressPercentage === 100 ? 'bg-success' : progressPercentage >= 70 ? 'bg-primary' : progressPercentage >= 40 ? 'bg-warning' : 'bg-danger'}`}
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <span className="fs-7 text-muted mt-1">{progressPercentage}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-light-${noConformidad.estaAprobado ? 'success' : 'warning'} fs-7 fw-bold`}>
                          {noConformidad.estaAprobado ? 'Aprobado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchNoConformidadODS(noConformidad.id)}>
                          <KTIcon iconName="pencil" className="fs-3" />
                        </button>
                        <button className="btn btn-icon btn-bg-light btn-active-light-danger ms-3" onClick={() => openDeleteModal(noConformidad.id)}>
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
          filteredItems={filteredNoConformidadesODS}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar No Conformidad ODS" : "Editar No Conformidad ODS"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-5">
                <div className="form-group">
                  <label className="form-label required">Orden de Servicio</label>
                  <select
                    value={editedNoConformidadODS.odsId}
                    onChange={(e) => setEditedNoConformidadODS(prev => ({ ...prev, odsId: parseInt(e.target.value) }))}
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
                    value={editedNoConformidadODS.fecha}
                    onChange={(e) => setEditedNoConformidadODS(prev => ({ ...prev, fecha: e.target.value }))}
                    className="form-control"
                    disabled={!esOriginador}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Cantidad Total</label>
                  <input
                    type="number"
                    value={editedNoConformidadODS.cantidadTotal}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                      setEditedNoConformidadODS(prev => ({ ...prev, cantidadTotal: value }));
                    }}
                    onFocus={(e) => {
                      // Seleccionar todo el texto cuando se hace focus, especialmente si es 0
                      e.target.select();
                    }}
                    onClick={(e) => {
                      // También seleccionar al hacer click para mejor UX
                      e.currentTarget.select();
                    }}
                    className="form-control"
                    min="0"
                    disabled={!esOriginador}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Cantidad Cerradas</label>
                  <input
                    type="number"
                    value={editedNoConformidadODS.cantidadCerradas}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                      setEditedNoConformidadODS(prev => ({ ...prev, cantidadCerradas: value }));
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
                    min="0"
                    max={editedNoConformidadODS.cantidadTotal}
                    disabled={!esAprobador}
                    required
                  />
                </div>
                <div className="alert alert-info d-flex align-items-center p-5">
                  <KTIcon iconName="information-5" className="fs-2hx text-info me-4" />
                  <div className="d-flex flex-column">
                    <span className="fw-bold">Progreso: {getProgressPercentage(editedNoConformidadODS.cantidadCerradas, editedNoConformidadODS.cantidadTotal)}%</span>
                    <span className="fs-7">{editedNoConformidadODS.cantidadCerradas} de {editedNoConformidadODS.cantidadTotal} no conformidades cerradas</span>
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="estaAprobado"
                      checked={editedNoConformidadODS.estaAprobado}
                      onChange={(e) => setEditedNoConformidadODS(prev => ({ ...prev, estaAprobado: e.target.checked }))}
                      disabled={!esAprobador}
                    />
                    <label className="form-check-label fw-bold" htmlFor="estaAprobado">
                      Está Aprobado
                    </label>
                  </div>
                  <div className="form-text text-muted">
                    Solo los funcionarios de Cenit pueden aprobar este registro.
                  </div>
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createNoConformidadODS(editedNoConformidadODS);
              } else {
                updateNoConformidadODS(editedNoConformidadODS);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {modalType === 'delete' && (
          <ModalDialog
            title="Eliminar No Conformidad ODS"
            content="¿Estás seguro de que deseas eliminar esta no conformidad ODS? Esta acción no se puede deshacer."
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteNoConformidadODS}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}