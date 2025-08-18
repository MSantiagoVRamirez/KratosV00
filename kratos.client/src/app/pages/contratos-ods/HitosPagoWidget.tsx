import { useState, useEffect } from "react"
import { HitoPago } from "../../interfaces/contratos-ods/HitoPago"
import { ODS } from "../../interfaces/contratos-ods/ODS"
import hitosPagoService from "../../services/contratos-ods/hitoPagoService"
import odsService from "../../services/contratos-ods/odsService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAuth } from "../../modules/auth/AuthContext"

export function HitosPagoWidget({ selectedODSId, onUpdate }: { selectedODSId: number, onUpdate?: () => void }) {

  const { role } = useAuth();
  const currentRole = role || '';
  const esOriginador = currentRole === 'Administrador' || currentRole === 'Funcionario Contratista';
  const esAprobador = currentRole === 'Administrador' || currentRole === 'Funcionario Cenit';

  const defaultHitoPago: HitoPago = {
    id: 0,
    odsId: selectedODSId,
    numero: 'H1',
    descripcion: '',
    porcentaje: 0,
    valor: null,
    pagado: false,
    estado: null,
    estaCancelado: false,
    estaAprobado: false,
    estaRechazado: false,
    comentarioAprobacion: null,
    cumplimiento: false,
    fechaEjecutado: null,
    fechaProgramadaTardia: null
  }
  const [hitosPago, setHitosPago] = useState<HitoPago[]>([])
  const [editedHitoPago, setEditedHitoPago] = useState<HitoPago>(defaultHitoPago)
  const [deleteHitoPagoId, setDeleteHitoPagoId] = useState<number>(defaultHitoPago.id)

  const [ordenesServicio, setOrdenesServicio] = useState<ODS[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    odsId: { value: editedHitoPago.odsId, required: true, type: 'number' },
    numero: { value: editedHitoPago.numero, required: false, type: 'string' },
    descripcion: { value: editedHitoPago.descripcion, required: true, type: 'string' },
    porcentaje: { value: editedHitoPago.porcentaje, required: false, type: 'number' },
    valor: { value: editedHitoPago.valor, required: false, type: 'number' },
    estado: { value: editedHitoPago.estado, required: false, type: 'number' },
    fechaEjecutado: { value: editedHitoPago.fechaEjecutado, required: false, type: 'string' },
    fechaProgramadaTardia: { value: editedHitoPago.fechaProgramadaTardia, required: false, type: 'string' },
  });

  const formatCurrency = (number: number | string | null | undefined) => {
    if (number === undefined || number === null) return '';
    const parsed = typeof number === 'string' ? parseFloat(number.replace(/[^0-9]/g, '')) : number;
    if (isNaN(parsed)) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(parsed);
  };

  const handleChangeNumber = (fieldName: keyof HitoPago, rawInput: string) => {
    const numericValue = parseFloat(rawInput);
    setEditedHitoPago((prev) => ({
      ...prev,
      [fieldName]: isNaN(numericValue) ? null : numericValue, // Permitir null si el campo es opcional
    }));
  };

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

  const fetchHitosPago = () => {
    hitosPagoService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setHitosPago(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los hitos de pago", error)
      })
  }

  useEffect(() => {
    fetchOrdenesServicio()
    fetchHitosPago()
  }, [selectedODSId])

  useEffect(() => {
    setEditedHitoPago({
      ...defaultHitoPago,
      odsId: selectedODSId || 0
    });
  }, [selectedODSId]);

  const fetchHitoPago = (id: number) => {
    hitosPagoService.get(id)
      .then((response) => {
        setEditedHitoPago(response.data)
        setModalType('edit')
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el hito de pago", error)
      })
  }

  const createHitoPago = (data: HitoPago) => {
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    hitosPagoService.create(dataToSend)
      .then(() => {
        setEditedHitoPago(defaultHitoPago)
        alert("Hito de pago creado exitosamente")
        closeModal()
        fetchHitosPago()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al crear el hito de pago", error)
        alert(`Error al crear hito de pago: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const updateHitoPago = (data: HitoPago) => {
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    hitosPagoService.update(dataToSend)
      .then(() => {
        setEditedHitoPago(defaultHitoPago)
        alert("Hito de pago actualizado exitosamente")
        closeModal()
        fetchHitosPago()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el hito de pago", error)
        alert(`Error al actualizar hito de pago: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const deleteHitoPago = () => {
    hitosPagoService.remove(deleteHitoPagoId)
      .then(() => {
        setDeleteHitoPagoId(defaultHitoPago.id)
        alert("Hito de pago eliminado exitosamente")
        closeModal()
        fetchHitosPago()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el hito de pago", error)
        alert(`Error al eliminar hito de pago: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const openDeleteModal = (id: number) => {
    setDeleteHitoPagoId(id)
    setModalType('delete')
  }

  const filteredHitosPagoByODS = hitosPago.filter(hito => hito.odsId === selectedODSId)

  const filteredHitosPago = filteredHitosPagoByODS.filter(hito => {
    const ods = ordenesServicio.find(o => o.id === hito.odsId);
    const searchTermLower = searchTerm.toLowerCase();
    const fechaEjecutadoStr = hito.fechaEjecutado ? new Date(hito.fechaEjecutado).toLocaleDateString('es-CO') : '';
    const fechaProgramadaTardiaStr = hito.fechaProgramadaTardia ? new Date(hito.fechaProgramadaTardia).toLocaleDateString('es-CO') : '';

    return (
      ods?.nombre.toLowerCase().includes(searchTermLower) ||
      hito.numero.toLowerCase().includes(searchTermLower) ||
      hito.descripcion.toLowerCase().includes(searchTermLower) ||
      (hito.porcentaje?.toString().toLowerCase().includes(searchTermLower)) ||
      (hito.valor?.toString().toLowerCase().includes(searchTermLower)) ||
      (hito.pagado ? "pagado" : "pendiente").includes(searchTermLower) ||
      (hito.estaAprobado ? 'aprobado' : '').includes(searchTermLower) ||
      (hito.estaCancelado ? 'cancelado' : '').includes(searchTermLower) ||
      (hito.estaRechazado ? 'rechazado' : '').includes(searchTermLower) ||
      (hito.cumplimiento ? 'cumplido' : 'incumplido').includes(searchTermLower) ||
      fechaEjecutadoStr.toLowerCase().includes(searchTermLower) ||
      fechaProgramadaTardiaStr.toLowerCase().includes(searchTermLower)
    );
  })

  const applyPagination = (data: HitoPago[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  const shownHitosPago = applyPagination(filteredHitosPago)

  return (
    <>
      <div className="card mx-10 my-10 mx-0-sm">
        <div className="card-header">
          <div className="card-title fw-bold fs-2">Hitos de Pago</div>
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
              setEditedHitoPago({
                ...defaultHitoPago,
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
                  <th className='min-w-100px rounded-start ps-5'>Número</th>
                  <th className='min-w-100px'>Descripción</th>
                  <th className='min-w-100px'>%</th>
                  <th className='min-w-100px'>Valor</th>
                  <th className='min-w-100px'>Pagado</th>
                  <th className='min-w-100px'>Estado</th>
                  <th className='min-w-100px'>Cumplimiento</th>
                  <th className='min-w-120px'>Fecha Ejecutado</th>
                  <th className='min-w-120px'>Fecha Programada</th>
                  <th className='min-w-150px text-end rounded-end pe-5'>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shownHitosPago.map((hito) => (
                  <tr key={hito.id}>
                    <td>
                      <span className="fs-6 fw-bold ps-5">
                        {hito.numero}
                      </span>
                    </td>
                    <td>
                      <span className="fs-6">
                        {hito.descripcion}
                      </span>
                    </td>
                    <td><span className="fs-6">{hito.porcentaje !== null ? `${hito.porcentaje}%` : 'N/A'}</span></td>
                    {/* <td><span className="text-primary fw-bold fs-6">{formatCurrency(hito.valor)}</span></td> */}
                    <td>
                      <span className="text-primary fw-bold fs-6">
                        {hito.valor ? formatCurrency(hito.valor) : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${hito.pagado ? 'badge-light-success' : 'badge-light-danger'} fs-7 fw-bold`}>
                        {hito.pagado ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-light-${hito.estado === 0 ? 'warning' : hito.estado === 1 ? 'secondary' : hito.estado === 2 ? 'success' : 'danger'} fs-7 fw-bold`}>
                        { hito.estado === null ? 'Sin Estado' : (
                          hito.estado === 0 ? 'Pendiente' : hito.estado === 1 ? 'En Proceso' : hito.estado === 2 ? 'Completado' : hito.estado === 3 ? 'Cancelado' : hito.estado === 4 ? 'Rechazado' : 'No Definido'
                        )}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${hito.cumplimiento ? 'badge-light-success' : 'badge-light-warning'} fs-7 fw-bold`}>
                        {hito.cumplimiento ? 'Cumplido' : 'Pendiente'}
                      </span>
                    </td>
                    <td>
                      <span className="fs-7">
                        {hito.fechaEjecutado ? new Date(hito.fechaEjecutado).toLocaleDateString('es-CO') : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="fs-7">
                        {hito.fechaProgramadaTardia ? new Date(hito.fechaProgramadaTardia).toLocaleDateString('es-CO') : 'N/A'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchHitoPago(hito.id)}>
                        <KTIcon iconName="pencil" className="fs-3" />
                      </button>
                      <button className="btn btn-icon btn-bg-light btn-active-light-danger ms-3" onClick={() => openDeleteModal(hito.id)}>
                        <KTIcon iconName="trash" className="fs-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          filteredItems={filteredHitosPago}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Hito de Pago" : "Editar Hito de Pago"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-5">
                <div className="form-group">
                  <label className="form-label required">Orden de Servicio</label>
                  <select
                    value={editedHitoPago.odsId}
                    onChange={(e) => setEditedHitoPago(prev => ({ ...prev, odsId: parseInt(e.target.value) }))}
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
                  <label className="form-label required">Número</label>
                  <input
                    type="text"
                    placeholder="Se asigna automáticamente"
                    className="form-control"
                    disabled
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Descripción</label>
                  <input
                    type="text"
                    value={editedHitoPago.descripcion}
                    onChange={(e) => setEditedHitoPago(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="form-control"
                    disabled={!esOriginador}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Porcentaje (%)</label>
                  <input
                    type="number"
                    value={editedHitoPago.porcentaje ?? 0}
                    onChange={(e) => handleChangeNumber('porcentaje', e.target.value)}
                    className="form-control"
                    disabled={!esOriginador}
                    required
                  />
                </div>
                {/* <div className="form-group">
                  <label className="form-label required">Porcentaje (%)</label>
                  <input
                    type="range"
                    value={editedHitoPago.porcentaje ?? 0}
                    onChange={(e) => handleChangeNumber('porcentaje', e.target.value)}
                    className="form-range"
                    min="0"
                    max={filteredHitosPago.length > 0 ? 100 - filteredHitosPago.filter(hito => hito.id !== editedHitoPago.id).reduce((acc, hito) => acc + (hito.porcentaje || 0), 0) : 100}
                    step="1"
                    disabled={!esOriginador}
                    required
                  />
                  <div className="mt-2 d-flex justify-content-between">
                    <span>{editedHitoPago.porcentaje ?? 0}%</span>
                    <span className="form-text text-muted">
                      (Max: {filteredHitosPago.length > 0 ? 100 - filteredHitosPago.filter(hito => hito.id !== editedHitoPago.id).reduce((acc, hito) => acc + (hito.porcentaje || 0), 0) : 100}%)
                    </span>
                  </div>
                </div> */}
                <div className="form-check form-switch form-check-custom form-check-solid">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="hitoPagadoSwitch"
                    checked={editedHitoPago.pagado}
                    onChange={(e) => setEditedHitoPago(prev => ({ ...prev, pagado: e.target.checked }))}
                    disabled={!esAprobador || editedHitoPago.estado !== 2}
                  />
                  <label className="form-check-label" htmlFor="hitoPagadoSwitch">
                    Pagado
                  </label>
                </div>
                <div className="form-check form-switch form-check-custom form-check-danger form-check-solid">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="hitoCanceladoSwitch"
                    checked={editedHitoPago.estaCancelado}
                    onChange={(e) => setEditedHitoPago(prev => ({ ...prev, estaCancelado: e.target.checked }))}
                    disabled={!esAprobador}
                  />
                  <label className="form-check-label" htmlFor="hitoCanceladoSwitch">
                    Cancelado
                  </label>
                </div>
                <div className="form-check form-switch form-check-custom form-check-solid">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="hitoAprobadoSwitch"
                    checked={editedHitoPago.estaAprobado}
                    onChange={(e) => setEditedHitoPago(prev => ({ 
                      ...prev, 
                      estaAprobado: e.target.checked,
                      estaRechazado: e.target.checked ? false : prev.estaRechazado
                    }))}
                    disabled={!esAprobador}
                  />
                  <label className="form-check-label" htmlFor="hitoAprobadoSwitch">
                    Aprobado
                  </label>
                </div>
                <div className="form-check form-switch form-check-custom form-check-warning form-check-solid">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="hitoRechazadoSwitch"
                    checked={editedHitoPago.estaRechazado}
                    onChange={(e) => setEditedHitoPago(prev => ({ 
                      ...prev, 
                      estaRechazado: e.target.checked,
                      estaAprobado: e.target.checked ? false : prev.estaAprobado
                    }))}
                    disabled={!esAprobador}
                  />
                  <label className="form-check-label" htmlFor="hitoRechazadoSwitch">
                    Rechazado
                  </label>
                </div>
                <div className="form-check form-switch form-check-custom form-check-solid">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="hitoCumplimientoSwitch"
                    checked={editedHitoPago.cumplimiento}
                    onChange={(e) => setEditedHitoPago(prev => ({ ...prev, cumplimiento: e.target.checked }))}
                    disabled={!esAprobador}
                  />
                  <label className="form-check-label" htmlFor="hitoCumplimientoSwitch">
                    Cumplimiento
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha Ejecutado</label>
                  <input
                    type="date"
                    value={editedHitoPago.fechaEjecutado || ''}
                    onChange={(e) => setEditedHitoPago(prev => ({ ...prev, fechaEjecutado: e.target.value || null }))}
                    className="form-control"
                    disabled={!esAprobador}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha Programada Tardía</label>
                  <input
                    type="date"
                    value={editedHitoPago.fechaProgramadaTardia || ''}
                    onChange={(e) => setEditedHitoPago(prev => ({ ...prev, fechaProgramadaTardia: e.target.value || null }))}
                    className="form-control"
                    disabled={!esOriginador}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Comentario de Aprobación</label>
                  <textarea
                    placeholder="Comentario sobre la aprobación/rechazo (opcional)"
                    value={editedHitoPago.comentarioAprobacion || ''}
                    onChange={(e) => setEditedHitoPago(prev => ({ ...prev, comentarioAprobacion: e.target.value || null }))}
                    className="form-control"
                    rows={3}
                    disabled={!esAprobador}
                  />
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createHitoPago(editedHitoPago);
              } else {
                updateHitoPago(editedHitoPago);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {modalType === 'delete' && (
          <ModalDialog
            title="Eliminar Hito de Pago"
            content="¿Estás seguro de que deseas eliminar este hito de pago? Esta acción no se puede deshacer."
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteHitoPago}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}
