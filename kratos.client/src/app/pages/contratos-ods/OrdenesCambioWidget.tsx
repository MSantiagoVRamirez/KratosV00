import { useState, useEffect } from "react"
import { OrdenCambio } from "../../interfaces/contratos-ods/OrdenCambio"
import { ODS } from "../../interfaces/contratos-ods/ODS"
import ordenCambioService from "../../services/contratos-ods/ordenCambioService"
import odsService from "../../services/contratos-ods/odsService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation';

export function OrdenesCambioWidget({ selectedODSId, onUpdate }: { selectedODSId: number, onUpdate?: () => void }) {

  const defaultOrdenCambio: OrdenCambio = {
    id: 0,
    odsId: selectedODSId,
    nuevaFechaFin: '',
    valorHHAdicional: 0,
    valorViajesAdicional: 0,
    valorEstudiosAdicional: 0,
    valorSumaGlobalFijaAdicional: 0,
    valorGastoReembolsableAdicional: 0,
  }
  const [ordenesCambio, setOrdenesCambio] = useState<OrdenCambio[]>([])
  const [editedOrdenCambio, setEditedOrdenCambio] = useState<OrdenCambio>(defaultOrdenCambio)
  const [deleteOrdenCambioId, setDeleteOrdenCambioId] = useState<number>(defaultOrdenCambio.id)

  const [ordenesServicio, setOrdenesServicio] = useState<ODS[]>([])

  // Estados para los valores de display de los inputs monetarios
  const [valorHHDisplay, setValorHHDisplay] = useState<string>('')
  const [valorViajesDisplay, setValorViajesDisplay] = useState<string>('')
  const [valorEstudiosDisplay, setValorEstudiosDisplay] = useState<string>('')
  const [valorGastoReembolsableDisplay, setValorGastoReembolsableDisplay] = useState<string>('')

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | 'restart' | null>(null)

  // Palabra a buscar en el listado de usuarios
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => {
    setModalType(null);
    setValorHHDisplay('');
    setValorViajesDisplay('');
    setValorEstudiosDisplay('');
    setValorGastoReembolsableDisplay('');
  }

  // Validación del formulario
  const isFormValid = useFormValidation({
    odsId: { value: editedOrdenCambio.odsId, required: true, type: 'number' },
    nuevaFechaFin: { value: editedOrdenCambio.nuevaFechaFin, required: true, type: 'date' },
    valorHHAdicional: { value: editedOrdenCambio.valorHHAdicional, required: false, type: 'number' },
    valorViajesAdicional: { value: editedOrdenCambio.valorViajesAdicional, required: false, type: 'number' },
    valorEstudiosAdicional: { value: editedOrdenCambio.valorEstudiosAdicional, required: false, type: 'number' }
  });

  // Formatear el número a moneda
  const formatCurrency = (number: number | string) => {
    if (typeof number === 'string') {
      const cleaned = number.replace(/[^\d-]/g, '');
      if (cleaned === '-' || cleaned === '') return cleaned; // permite escribir el signo
      const parsed = parseFloat(cleaned);
      if (isNaN(parsed)) return cleaned;
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(parsed);
    }

    if (isNaN(number)) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Obtener el valor a mostrar en el input
  const getDisplayValue = (fieldType: 'valorHH' | 'valorViajes' | 'valorEstudios' | 'valorGastoReembolsable') => {
    if (fieldType === 'valorHH') {
      if (valorHHDisplay !== '') {
        return valorHHDisplay === '-' ? '-' : formatCurrency(valorHHDisplay);
      }
      if (editedOrdenCambio.id === 0 && editedOrdenCambio.valorHHAdicional === 0) {
        return '';
      }
      return formatCurrency(editedOrdenCambio.valorHHAdicional);
    } else if (fieldType === 'valorViajes') {
      if (valorViajesDisplay !== '') {
        return valorViajesDisplay === '-' ? '-' : formatCurrency(valorViajesDisplay);
      }
      if (editedOrdenCambio.id === 0 && editedOrdenCambio.valorViajesAdicional === 0) {
        return '';
      }
      return formatCurrency(editedOrdenCambio.valorViajesAdicional);
    } else if (fieldType === 'valorEstudios') {
      if (valorEstudiosDisplay !== '') {
        return valorEstudiosDisplay === '-' ? '-' : formatCurrency(valorEstudiosDisplay);
      }
      if (editedOrdenCambio.id === 0 && editedOrdenCambio.valorEstudiosAdicional === 0) {
        return '';
      }
      return formatCurrency(editedOrdenCambio.valorEstudiosAdicional);
    } else {
      if (valorGastoReembolsableDisplay !== '') {
        return valorGastoReembolsableDisplay === '-' ? '-' : formatCurrency(valorGastoReembolsableDisplay);
      }
      if (editedOrdenCambio.id === 0 && editedOrdenCambio.valorGastoReembolsableAdicional === 0) {
        return '';
      }
      return formatCurrency(editedOrdenCambio.valorGastoReembolsableAdicional);
    }
  };

  // Manejar el cambio de valor en el input de valorHHAdicional
  const handleChangeValorHH = (rawInput: string) => {
    if (rawInput === '-') {
      setValorHHDisplay('-');
      setEditedOrdenCambio((prev) => ({
        ...prev,
        valorHHAdicional: 0,
      }));
      return;
    }
    
    const cleaned = rawInput.replace(/[^\d-]/g, '').replace(/(?!^)-/g, '');
    setValorHHDisplay(cleaned);
    
    if (cleaned === '' || cleaned === '-') {
      setEditedOrdenCambio((prev) => ({
        ...prev,
        valorHHAdicional: 0,
      }));
      return;
    }
    
    const numericValue = parseInt(cleaned, 10);
    setEditedOrdenCambio((prev) => ({
      ...prev,
      valorHHAdicional: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  // Manejar el cambio de valor en el input de valorViajesAdicional
  const handleChangeValorViajes = (rawInput: string) => {
    if (rawInput === '-') {
      setValorViajesDisplay('-');
      setEditedOrdenCambio((prev) => ({
        ...prev,
        valorViajesAdicional: 0,
      }));
      return;
    }
    
    const cleaned = rawInput.replace(/[^\d-]/g, '').replace(/(?!^)-/g, '');
    setValorViajesDisplay(cleaned);
    
    if (cleaned === '' || cleaned === '-') {
      setEditedOrdenCambio((prev) => ({
        ...prev,
        valorViajesAdicional: 0,
      }));
      return;
    }
    
    const numericValue = parseInt(cleaned, 10);
    setEditedOrdenCambio((prev) => ({
      ...prev,
      valorViajesAdicional: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  // Manejar el cambio de valor en el input de valorEstudiosAdicional
  const handleChangeValorEstudios = (rawInput: string) => {
    if (rawInput === '-') {
      setValorEstudiosDisplay('-');
      setEditedOrdenCambio((prev) => ({
        ...prev,
        valorEstudiosAdicional: 0,
      }));
      return;
    }
    
    const cleaned = rawInput.replace(/[^\d-]/g, '').replace(/(?!^)-/g, '');
    setValorEstudiosDisplay(cleaned);
    
    if (cleaned === '' || cleaned === '-') {
      setEditedOrdenCambio((prev) => ({
        ...prev,
        valorEstudiosAdicional: 0,
      }));
      return;
    }
    
    const numericValue = parseInt(cleaned, 10);
    setEditedOrdenCambio((prev) => ({
      ...prev,
      valorEstudiosAdicional: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  // Manejar el cambio de valor en el input de valorGastoReembolsableAdicional
  const handleChangeValorGastoReembolsable = (rawInput: string) => {
    if (rawInput === '-') {
      setValorGastoReembolsableDisplay('-');
      setEditedOrdenCambio((prev) => ({
        ...prev,
        valorGastoReembolsableAdicional: 0,
      }));
      return;
    }
    
    const cleaned = rawInput.replace(/[^\d-]/g, '').replace(/(?!^)-/g, '');
    setValorGastoReembolsableDisplay(cleaned);
    
    if (cleaned === '' || cleaned === '-') {
      setEditedOrdenCambio((prev) => ({
        ...prev,
        valorGastoReembolsableAdicional: 0,
      }));
      return;
    }
    
    const numericValue = parseInt(cleaned, 10);
    setEditedOrdenCambio((prev) => ({
      ...prev,
      valorGastoReembolsableAdicional: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  // Obtener todas las órdenes de servicio
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

  // Obtener todas las ordenes de cambio
  const fetchOrdenesCambio = () => {
    ordenCambioService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setOrdenesCambio(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las ordenes de cambio", error)
      })
  }

  // Obtener todas las ordenes de cambio cada vez que se renderiza el componente
  useEffect(() => {
    fetchOrdenesServicio()  // Obtener todas las órdenes de servicio
    fetchOrdenesCambio()  // Obtener todas las ordenes de cambio
  }, [selectedODSId]) // Recargar si cambia la ODS seleccionada

  // Re-inicializar el estado por defecto si cambia la ODS seleccionada
  useEffect(() => {
    setEditedOrdenCambio({
      ...defaultOrdenCambio,
      odsId: selectedODSId || 0
    });
  }, [selectedODSId]);

  // Obtener una sola orden de cambio (para editar)
  const fetchOrdenCambio = (id: number) => {
    ordenCambioService.get(id)
      .then((response) => {
        setEditedOrdenCambio(response.data)  // Llenar el estado unificado
        // Limpiar estados de display para que se muestren los valores formateados
        setValorHHDisplay('');
        setValorViajesDisplay('');
        setValorEstudiosDisplay('');
        setValorGastoReembolsableDisplay('');
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener la orden de cambio", error)
      })
  }

  // Crear una orden de cambio
  const createOrdenCambio = (data: OrdenCambio) => {
    // Asegurar odsId si viene de prop
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    ordenCambioService.create(dataToSend)
      .then(() => {
        setEditedOrdenCambio(defaultOrdenCambio) // Resetear estado unificado
        setValorHHDisplay('');
        setValorViajesDisplay('');
        setValorEstudiosDisplay('');
        setValorGastoReembolsableDisplay('');
        alert("Orden de cambio creada exitosamente")
        closeModal()  // Ocultar el formulario
        fetchOrdenesCambio()  // Actualizar la lista de ordenes de cambio
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al crear la orden de cambio", error)
        alert(`Error al crear orden de cambio: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar una orden de cambio
  const updateOrdenCambio = (data: OrdenCambio) => {
    // Asegurar odsId
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    ordenCambioService.update(dataToSend)
      .then(() => {
        setEditedOrdenCambio(defaultOrdenCambio) // Resetear estado unificado
        setValorHHDisplay('');
        setValorViajesDisplay('');
        setValorEstudiosDisplay('');
        setValorGastoReembolsableDisplay('');
        alert("Orden de cambio actualizada exitosamente")
        closeModal()  // Ocultar el formulario
        fetchOrdenesCambio()  // Actualizar la lista de ordenes de cambio
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar la orden de cambio", error)
        alert(`Error al actualizar orden de cambio: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar una orden de cambio
  const deleteOrdenCambio = () => {
    ordenCambioService.remove(deleteOrdenCambioId)
      .then(() => {
        // Actualizar inmediatamente el estado local removiendo el elemento eliminado
        setOrdenesCambio(prevOrdenesCambio => 
          prevOrdenesCambio.filter(ordenCambio => ordenCambio.id !== deleteOrdenCambioId)
        )
        setDeleteOrdenCambioId(defaultOrdenCambio.id) // Limpiar el input de eliminación
        alert("Orden de cambio eliminada exitosamente")
        closeModal()  // Ocultar el formulario
        // También hacer fetch para asegurar sincronización con el servidor
        fetchOrdenesCambio()  // Actualizar la lista de ordenes de cambio
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar la orden de cambio", error)
        alert(`Error al eliminar orden de cambio: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteOrdenCambioId(id)
    setModalType('delete')
  }

  // Filtrar las ordenes de cambio por el id de la orden de servicio
  const filteredOrdenesCambioByODS = ordenesCambio.filter(ordenCambio => ordenCambio.odsId === selectedODSId)

  // Filtrar las ordenes de cambio por la palabra a buscar
  const filteredOrdenesCambio = filteredOrdenesCambioByODS.filter(ordenCambio => {
    const odsOriginal = ordenesServicio.find((ods) => ods.id === ordenCambio.odsId);
    const fechaFinOriginalStr = odsOriginal?.fechaFin ? new Date(odsOriginal.fechaFin).toLocaleDateString('es-CO') : '';
    const nuevaFechaFinStr = ordenCambio.nuevaFechaFin ? new Date(ordenCambio.nuevaFechaFin).toLocaleDateString('es-CO') : '';
    const duracionAdicional = odsOriginal?.fechaFin && ordenCambio.nuevaFechaFin
      ? Math.ceil((new Date(ordenCambio.nuevaFechaFin).getTime() - new Date(odsOriginal.fechaFin).getTime()) / (1000 * 3600 * 24))
      : 0; // Calculate difference in days

    const searchTermLower = searchTerm.toLowerCase();

    return (
      odsOriginal?.nombre.toLowerCase().includes(searchTermLower) ||
      ordenCambio.valorHHAdicional.toString().includes(searchTermLower) ||
      ordenCambio.valorViajesAdicional.toString().includes(searchTermLower) ||
      ordenCambio.valorEstudiosAdicional.toString().includes(searchTermLower) ||
      ordenCambio.valorSumaGlobalFijaAdicional.toString().includes(searchTermLower) ||
      duracionAdicional.toString().includes(searchTermLower) ||
      nuevaFechaFinStr.includes(searchTermLower) ||
      fechaFinOriginalStr.includes(searchTermLower) // Permitir buscar por la fecha fin original también
    )
  })

  // Aplicar paginación a los datos
  const applyPagination = (data: OrdenCambio[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a las ordenes de cambio filtradas
  const shownOrdenesCambio = applyPagination(filteredOrdenesCambio)

  return (
    <>
      {/* Listado de Ordenes de Cambio */}
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Ordenes de Cambio
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
              setEditedOrdenCambio({
                ...defaultOrdenCambio,
                odsId: selectedODSId || 0,
              });
              // Limpiar estados de display
              setValorHHDisplay('');
              setValorViajesDisplay('');
              setValorEstudiosDisplay('');
              setValorGastoReembolsableDisplay('');
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
                  <th className='min-w-150px rounded-start ps-5'>Orden de Servicio</th>
                  <th className='min-w-150px'>Valor Adicional</th>
                  <th className='min-w-150px'>Nueva Fecha Fin</th>
                  <th className='min-w-120px'>Duración Adicional</th>
                  <th className='min-w-150px text-end rounded-end pe-5'>Acciones</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {shownOrdenesCambio.map((ordenCambio) => {
                  const odsOriginal = ordenesServicio.find((ods) => ods.id === ordenCambio.odsId);
                  const duracionAdicional = odsOriginal?.fechaFinalOriginal && ordenCambio.nuevaFechaFin
                    ? Math.ceil((new Date(ordenCambio.nuevaFechaFin).getTime() - new Date(odsOriginal.fechaFinalOriginal).getTime()) / (1000 * 3600 * 24) + 1)
                    : null; // Calculate difference in days, null if not possible

                  return (
                    <tr key={ordenCambio.id}>
                      <td>
                        <span className="fs-6 fw-bold ps-5">
                          {odsOriginal?.nombre || 'N/A'}
                        </span>
                        {odsOriginal?.fechaFinalOriginal && (
                          <span className="d-block text-muted fs-7 ps-5">
                            Fin original: {new Date(odsOriginal.fechaFinalOriginal).toLocaleDateString('es-CO')}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="text-primary d-block fw-bold fs-6">
                          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(ordenCambio.valorSumaGlobalFijaAdicional)}
                        </span>
                      </td>
                      <td>
                        <span className="d-block fs-6">
                          {new Date(ordenCambio.nuevaFechaFin).toLocaleDateString('es-CO')}
                        </span>
                      </td>
                      <td>
                        {duracionAdicional !== null ? (
                          <span className={`d-block fw-bold fs-6 ${duracionAdicional >= 0 ? 'text-success' : 'text-danger'}`}>
                            {duracionAdicional} días
                          </span>
                        ) : (
                          <span className="d-block text-muted fs-7">N/A</span>
                        )}
                      </td>
                      <td className="text-end">
                        <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchOrdenCambio(ordenCambio.id)}>
                          <KTIcon iconName="pencil" className="fs-3" />
                        </button>
                        <button className="btn btn-icon btn-bg-light btn-active-light-danger ms-3" onClick={() => openDeleteModal(ordenCambio.id)}>
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

        {/* Paginación */}
        <Pagination
          filteredItems={filteredOrdenesCambio}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Orden de Cambio */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Orden de Cambio" : "Editar Orden de Cambio"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-5">
                {/* --- Campos del Formulario usando editedOrdenCambio --- */}
                <div className="form-group">
                  <label className="form-label required"> Orden de Servicio </label>
                  <select
                    value={editedOrdenCambio.odsId}
                    onChange={(e) => setEditedOrdenCambio(prev => ({ ...prev, odsId: parseInt(e.target.value) }))}
                    className="form-select"
                    disabled={true} // Siempre deshabilitado, ya que viene del widget padre
                    required
                  >
                    {selectedODSId !== 0 ? (
                      <option value={selectedODSId}>
                        {ordenesServicio.find(ods => ods.id === selectedODSId)?.nombre || 'Cargando...'}
                      </option>
                    ) : (
                      <option value="">Seleccione una ODS primero</option> // Mensaje si no hay ODS seleccionada
                    )}
                  </select>
                  {ordenesServicio.find(ods => ods.id === selectedODSId)?.fechaFin && (
                    <div className="text-muted fs-7 mt-1">Fecha fin original de ODS: {new Date(ordenesServicio.find(ods => ods.id === selectedODSId)!.fechaFin!).toLocaleDateString('es-CO')}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label required"> Nueva Fecha de Fin </label>
                  <input
                    type="date"
                    // Formatear fecha para input tipo date
                    value={editedOrdenCambio.nuevaFechaFin ? new Date(editedOrdenCambio.nuevaFechaFin).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditedOrdenCambio(prev => ({ ...prev, nuevaFechaFin: e.target.value }))}
                    className="form-control"
                    required
                  />
                  <div className="text-muted fs-7 mt-1">Define la nueva fecha de finalización para la ODS asociada.</div>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label required"> Valor Adicional HH </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="-?[0-9]*[.,]?[0-9]*"
                        placeholder="Valor en pesos colombianos (COP) - Acepta valores negativos"
                        value={getDisplayValue('valorHH')}
                        onChange={(e) => handleChangeValorHH(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label required"> Valor Adicional Viajes </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="-?[0-9]*[.,]?[0-9]*"
                        placeholder="Valor en pesos colombianos (COP) - Acepta valores negativos"
                        value={getDisplayValue('valorViajes')}
                        onChange={(e) => handleChangeValorViajes(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label required"> Valor Adicional Estudios </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="-?[0-9]*[.,]?[0-9]*"
                        placeholder="Valor en pesos colombianos (COP) - Acepta valores negativos"
                        value={getDisplayValue('valorEstudios')}
                        onChange={(e) => handleChangeValorEstudios(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label required"> Valor Suma Global Fija Adicional </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Valor Suma Global Fija (COP)"
                        value={formatCurrency(editedOrdenCambio.valorHHAdicional + editedOrdenCambio.valorViajesAdicional + editedOrdenCambio.valorEstudiosAdicional)}
                        onChange={() => {}} // Campo calculado, no editable
                        className="form-control"
                        required
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label required"> Valor Gasto Reembolsable Adicional </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="-?[0-9]*[.,]?[0-9]*"
                        placeholder="Valor en pesos colombianos (COP) - Acepta valores negativos"
                        value={getDisplayValue('valorGastoReembolsable')}
                        onChange={(e) => handleChangeValorGastoReembolsable(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="text-muted fs-7 mt-1">Ingrese los valores adicionales en pesos colombianos (COP) para cada concepto.</div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createOrdenCambio(editedOrdenCambio);
              } else {
                updateOrdenCambio(editedOrdenCambio);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Caja de Confirmación de Eliminación de Orden de Cambio */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Eliminar Orden de Cambio"
            content="¿Estás seguro de que deseas eliminar esta orden de cambio? Esta acción no se puede deshacer."
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteOrdenCambio}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}