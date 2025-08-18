import { useState, useEffect } from "react"
import { HallazgoODS } from "../../interfaces/secs/HallazgoODS"
import { ODS } from "../../interfaces/contratos-ods/ODS"
import hallazgoODSService from "../../services/secs/hallazgoODSService"
import odsService from "../../services/contratos-ods/odsService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAuth } from "../../modules/auth/AuthContext"

export function HallazgosODSWidget({ selectedODSId, onUpdate }: { selectedODSId: number, onUpdate?: () => void }) {

  const { role } = useAuth();
  const currentRole = role || '';
  const esOriginador = currentRole === 'Administrador' || currentRole === 'Funcionario Contratista';
  const esAprobador = currentRole === 'Administrador' || currentRole === 'Funcionario Cenit';

  const defaultHallazgoODS: HallazgoODS = {
    id: 0,
    odsId: selectedODSId,
    fecha: new Date().toISOString().split('T')[0],
    cantidadTotal: 0,
    cantidadCerradas: 0,
    estaAprobado: false
  }
  
  const [hallazgosODS, setHallazgosODS] = useState<HallazgoODS[]>([])
  const [editedHallazgoODS, setEditedHallazgoODS] = useState<HallazgoODS>(defaultHallazgoODS)
  const [deleteHallazgoODSId, setDeleteHallazgoODSId] = useState<number>(defaultHallazgoODS.id)

  const [ordenesServicio, setOrdenesServicio] = useState<ODS[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    odsId: { value: editedHallazgoODS.odsId, required: true, type: 'number' },
    fecha: { value: editedHallazgoODS.fecha, required: true, type: 'string' },
    cantidadTotal: { value: editedHallazgoODS.cantidadTotal, required: true, type: 'number' },
    cantidadCerradas: { value: editedHallazgoODS.cantidadCerradas, required: true, type: 'number' },
    estaAprobado: { value: editedHallazgoODS.estaAprobado, required: false, type: 'boolean' },
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

  const fetchHallazgosODS = () => {
    hallazgoODSService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setHallazgosODS(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los hallazgos ODS", error)
      })
  }

  useEffect(() => {
    fetchOrdenesServicio()
    fetchHallazgosODS()
  }, [selectedODSId])

  useEffect(() => {
    setEditedHallazgoODS({
      ...defaultHallazgoODS,
      odsId: selectedODSId || 0
    });
  }, [selectedODSId]);

  const fetchHallazgoODS = (id: number) => {
    hallazgoODSService.get(id)
      .then((response) => {
        setEditedHallazgoODS(response.data)
        setModalType('edit')
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el hallazgo ODS", error)
      })
  }

  const createHallazgoODS = (data: HallazgoODS) => {
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    hallazgoODSService.create(dataToSend)
      .then(() => {
        setEditedHallazgoODS(defaultHallazgoODS)
        alert("Hallazgo ODS creado exitosamente")
        closeModal()
        fetchHallazgosODS()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al crear el hallazgo ODS", error)
        alert(`Error al crear hallazgo ODS: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const updateHallazgoODS = (data: HallazgoODS) => {
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    hallazgoODSService.update(dataToSend)
      .then(() => {
        setEditedHallazgoODS(defaultHallazgoODS)
        alert("Hallazgo ODS actualizado exitosamente")
        closeModal()
        fetchHallazgosODS()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el hallazgo ODS", error)
        alert(`Error al actualizar hallazgo ODS: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const deleteHallazgoODS = () => {
    hallazgoODSService.remove(deleteHallazgoODSId)
      .then(() => {
        setDeleteHallazgoODSId(defaultHallazgoODS.id)
        alert("Hallazgo ODS eliminado exitosamente")
        closeModal()
        fetchHallazgosODS()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el hallazgo ODS", error)
        alert(`Error al eliminar hallazgo ODS: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const openDeleteModal = (id: number) => {
    setDeleteHallazgoODSId(id)
    setModalType('delete')
  }

  const filteredHallazgosByODS = hallazgosODS.filter(hallazgo => hallazgo.odsId === selectedODSId)

  const filteredHallazgosODS = filteredHallazgosByODS.filter(hallazgo => {
    const ods = ordenesServicio.find(o => o.id === hallazgo.odsId);
    const searchTermLower = searchTerm.toLowerCase();

    return (
      ods?.nombre.toLowerCase().includes(searchTermLower) ||
      hallazgo.fecha.toLowerCase().includes(searchTermLower) ||
      hallazgo.cantidadTotal.toString().includes(searchTermLower) ||
      hallazgo.cantidadCerradas.toString().includes(searchTermLower)
    );
  })

  const applyPagination = (data: HallazgoODS[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  const shownHallazgosODS = applyPagination(filteredHallazgosODS)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  }

  const getProgressPercentage = (cerradas: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((cerradas / total) * 100);
  }

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return 'success';
    if (percentage >= 70) return 'primary';
    if (percentage >= 40) return 'warning';
    return 'danger';
  }

  return (
    <>
      <div className="card mx-10 my-10 mx-0-sm">
        <div className="card-header">
          <div className="card-title fw-bold fs-2">Hallazgos ODS</div>
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
              setEditedHallazgoODS({
                ...defaultHallazgoODS,
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
                {shownHallazgosODS.map((hallazgo) => {
                  const progressPercentage = getProgressPercentage(hallazgo.cantidadCerradas, hallazgo.cantidadTotal);
                  const progressColor = getProgressColor(progressPercentage);
                  return (
                    <tr key={hallazgo.id}>
                      <td>
                        <span className="fs-6 fw-bold ps-5">
                          {formatDate(hallazgo.fecha)}
                        </span>
                      </td>
                      <td>
                        <span className="fs-6 fw-bold text-primary">
                          {hallazgo.cantidadTotal}
                        </span>
                      </td>
                      <td>
                        <span className="fs-6 fw-bold text-success">
                          {hallazgo.cantidadCerradas}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <div className="progress h-8px w-100">
                            <div 
                              className={`progress-bar bg-${progressColor}`}
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <span className="fs-7 text-muted mt-1">{progressPercentage}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-light-${hallazgo.estaAprobado ? 'success' : 'warning'} fs-7 fw-bold`}>
                          {hallazgo.estaAprobado ? 'Aprobado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchHallazgoODS(hallazgo.id)}>
                          <KTIcon iconName="pencil" className="fs-3" />
                        </button>
                        <button className="btn btn-icon btn-bg-light btn-active-light-danger ms-3" onClick={() => openDeleteModal(hallazgo.id)}>
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
          filteredItems={filteredHallazgosODS}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Hallazgo ODS" : "Editar Hallazgo ODS"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-5">
                <div className="form-group">
                  <label className="form-label required">Orden de Servicio</label>
                  <select
                    value={editedHallazgoODS.odsId}
                    onChange={(e) => setEditedHallazgoODS(prev => ({ ...prev, odsId: parseInt(e.target.value) }))}
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
                    value={editedHallazgoODS.fecha}
                    onChange={(e) => setEditedHallazgoODS(prev => ({ ...prev, fecha: e.target.value }))}
                    className="form-control"
                    disabled={!esOriginador}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Cantidad Total</label>
                  <input
                    type="number"
                    value={editedHallazgoODS.cantidadTotal}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                      setEditedHallazgoODS(prev => ({ ...prev, cantidadTotal: value }));
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
                    disabled={!esOriginador}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Cantidad Cerradas</label>
                  <input
                    type="number"
                    value={editedHallazgoODS.cantidadCerradas}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                      setEditedHallazgoODS(prev => ({ ...prev, cantidadCerradas: value }));
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
                    max={editedHallazgoODS.cantidadTotal}
                    disabled={!esAprobador}
                    required
                  />
                </div>
                <div className="alert alert-info d-flex align-items-center p-5">
                  <KTIcon iconName="information-5" className="fs-2hx text-info me-4" />
                  <div className="d-flex flex-column">
                    <span className="fw-bold">Progreso: {getProgressPercentage(editedHallazgoODS.cantidadCerradas, editedHallazgoODS.cantidadTotal)}%</span>
                    <span className="fs-7">{editedHallazgoODS.cantidadCerradas} de {editedHallazgoODS.cantidadTotal} hallazgos cerrados</span>
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="estaAprobado"
                      checked={editedHallazgoODS.estaAprobado}
                      onChange={(e) => setEditedHallazgoODS(prev => ({ ...prev, estaAprobado: e.target.checked }))}
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
                createHallazgoODS(editedHallazgoODS);
              } else {
                updateHallazgoODS(editedHallazgoODS);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {modalType === 'delete' && (
          <ModalDialog
            title="Eliminar Hallazgo ODS"
            content="¿Estás seguro de que deseas eliminar este hallazgo ODS? Esta acción no se puede deshacer."
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteHallazgoODS}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}