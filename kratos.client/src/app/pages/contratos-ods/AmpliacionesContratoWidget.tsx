import { useState, useEffect } from "react"
import { AmpliacionContrato } from "../../interfaces/contratos-ods/AmpliacionContrato"
import { Contrato } from "../../interfaces/contratos-ods/Contrato"
import ampliacionContratoService from "../../services/contratos-ods/ampliacionContratoService"
import contratoService from "../../services/contratos-ods/contratoService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation';

export function AmpliacionesContratoWidget({ selectedContratoId, onUpdate }: { selectedContratoId: number, onUpdate?: () => void }) {

  const defaultAmpliacionContrato: AmpliacionContrato = {
    id: 0,
    contratoId: selectedContratoId,
    nuevaFechaFin: '',
    valorCostoDirectoAdicional: 0,
    valorGastosRembolsablesAdicional: 0
  }
  const [ampliacionesContrato, setAmpliacionesContrato] = useState<AmpliacionContrato[]>([])
  const [editedAmpliacionContrato, setEditedAmpliacionContrato] = useState<AmpliacionContrato>(defaultAmpliacionContrato)
  const [deleteAmpliacionContratoId, setDeleteAmpliacionContratoId] = useState<number>(defaultAmpliacionContrato.id)

  const [contratos, setContratos] = useState<Contrato[]>([])

  // Estados para los valores de display de los inputs monetarios
  const [costoDirectoDisplay, setCostoDirectoDisplay] = useState<string>('')
  const [gastosRembolsablesDisplay, setGastosRembolsablesDisplay] = useState<string>('')

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
    setCostoDirectoDisplay('');
    setGastosRembolsablesDisplay('');
  }

  // Validación del formulario
  const isFormValid = useFormValidation({
    contratoId: { value: editedAmpliacionContrato.contratoId, required: true, type: 'number' },
    nuevaFechaFin: { value: editedAmpliacionContrato.nuevaFechaFin, required: true, type: 'date' },
    valorCostoDirectoAdicional: { value: editedAmpliacionContrato.valorCostoDirectoAdicional, required: false, type: 'number' },
    valorGastosRembolsablesAdicional: { value: editedAmpliacionContrato.valorGastosRembolsablesAdicional, required: false, type: 'number' },
  });

  // Obtener todos los contratos
  const fetchContratos = () => {
    contratoService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setContratos(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los contratos", error)
      })
  }

  // Obtener todas las ampliaciones de contrato
  const fetchAmpliacionesContrato = () => {
    ampliacionContratoService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setAmpliacionesContrato(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las ordenes de cambio", error)
      })
  }

  // Obtener todas las ampliaciones de contrato cada vez que se renderiza el componente
  useEffect(() => {
    fetchContratos()  // Obtener todos los contratos
    fetchAmpliacionesContrato()  // Obtener todas las ampliaciones de contrato
  }, [selectedContratoId])

  // Obtener una sola ampliación de contrato (para editar)
  const fetchAmpliacionContrato = (id: number) => {
    ampliacionContratoService.get(id)
      .then((response) => {
        setEditedAmpliacionContrato(response.data)  // Llenar el estado unificado
        // Limpiar estados de display para que se muestren los valores formateados
        setCostoDirectoDisplay('');
        setGastosRembolsablesDisplay('');
        setModalType('edit')  // Mostrar el formulario de edición
      })
      .catch((error) => {
        console.error("Hubo un error al obtener la orden de cambio", error)
      })
  }

  // Crear una ampliación de contrato
  const createAmpliacionContrato = (data: AmpliacionContrato) => {
    const dataToSend = {
      ...data,
      contratoId: data.contratoId || selectedContratoId
    };
    ampliacionContratoService.create(dataToSend)
      .then(() => {
        setEditedAmpliacionContrato(defaultAmpliacionContrato)
        setCostoDirectoDisplay('');
        setGastosRembolsablesDisplay('');
        alert("Ampliación de contrato creada exitosamente")
        closeModal()
        fetchAmpliacionesContrato()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al crear la orden de cambio", error)
        alert(`Error al crear orden de cambio: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Actualizar una ampliación de contrato
  const updateAmpliacionContrato = (data: AmpliacionContrato) => {
    const dataToSend = {
      ...data,
      contratoId: data.contratoId || selectedContratoId
    };

    ampliacionContratoService.update(dataToSend)
      .then(() => {
        setEditedAmpliacionContrato(defaultAmpliacionContrato)
        setCostoDirectoDisplay('');
        setGastosRembolsablesDisplay('');
        alert("Orden de cambio actualizada exitosamente")
        closeModal()
        fetchAmpliacionesContrato()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar la orden de cambio", error)
        alert(`Error al actualizar orden de cambio: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Eliminar una ampliación de contrato
  const deleteAmpliacionContrato = () => {
    ampliacionContratoService.remove(deleteAmpliacionContratoId)
      .then(() => {
        // Actualizar inmediatamente el estado local removiendo el elemento eliminado
        setAmpliacionesContrato(prevAmpliaciones => 
          prevAmpliaciones.filter(ampliacion => ampliacion.id !== deleteAmpliacionContratoId)
        )
        setDeleteAmpliacionContratoId(defaultAmpliacionContrato.id)
        alert("Orden de cambio eliminada exitosamente")
        closeModal()
        // También hacer fetch para asegurar sincronización con el servidor
        fetchAmpliacionesContrato()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar la orden de cambio", error)
        alert(`Error al eliminar orden de cambio: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  // Mostrar el cuadro de diálogo de confirmar eliminación
  const openDeleteModal = (id: number) => {
    setDeleteAmpliacionContratoId(id)
    setModalType('delete')
  }

  // Filtrar las ampliaciones de contrato por el contratoId
  const filteredAmpliaciones = ampliacionesContrato.filter(ampliacion => ampliacion.contratoId === selectedContratoId)

  // Filtrar las ampliaciones de contrato por la palabra a buscar
  const filteredAmpliacionesContrato = filteredAmpliaciones.filter(ampliacionContrato => {
    const valorTotal = ampliacionContrato.valorCostoDirectoAdicional + ampliacionContrato.valorGastosRembolsablesAdicional;
    return (
      contratos.find((contrato) => contrato.id === ampliacionContrato.contratoId)?.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      valorTotal.toString().includes(searchTerm) ||
      ampliacionContrato.valorCostoDirectoAdicional.toString().includes(searchTerm) ||
      ampliacionContrato.valorGastosRembolsablesAdicional.toString().includes(searchTerm)
    )
  })

  // Aplicar paginación a los datos
  const applyPagination = (data: AmpliacionContrato[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  // Aplicar paginación a las ampliaciones de contrato filtradas
  const shownAmpliacionesContrato = applyPagination(filteredAmpliacionesContrato)

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
  const getDisplayValue = (fieldType: 'costoDirecto' | 'gastosRembolsables') => {
    if (fieldType === 'costoDirecto') {
      // Si hay un valor de display (usuario escribiendo), usarlo siempre
      if (costoDirectoDisplay !== '') {
        return costoDirectoDisplay === '-' ? '-' : formatCurrency(costoDirectoDisplay);
      }
      // Si es un nuevo registro (id === 0) y el valor es 0, mostrar campo vacío
      if (editedAmpliacionContrato.id === 0 && editedAmpliacionContrato.valorCostoDirectoAdicional === 0) {
        return '';
      }
      // Si no, formatear el valor numérico
      return formatCurrency(editedAmpliacionContrato.valorCostoDirectoAdicional);
    } else {
      // Si hay un valor de display (usuario escribiendo), usarlo siempre
      if (gastosRembolsablesDisplay !== '') {
        return gastosRembolsablesDisplay === '-' ? '-' : formatCurrency(gastosRembolsablesDisplay);
      }
      // Si es un nuevo registro (id === 0) y el valor es 0, mostrar campo vacío
      if (editedAmpliacionContrato.id === 0 && editedAmpliacionContrato.valorGastosRembolsablesAdicional === 0) {
        return '';
      }
      // Si no, formatear el valor numérico
      return formatCurrency(editedAmpliacionContrato.valorGastosRembolsablesAdicional);
    }
  };

  // Manejar el cambio de valor en el input de moneda
  const handleChangeCostoDirecto = (rawInput: string) => {
    // Si el usuario escribe solo "-" y el input actual es "$0", permitirlo
    if (rawInput === '-') {
      setCostoDirectoDisplay('-');
      setEditedAmpliacionContrato((prev) => ({
        ...prev,
        valorCostoDirectoAdicional: 0,
      }));
      return;
    }
    
    // Permitir solo números y el signo negativo al inicio
    const cleaned = rawInput.replace(/[^\d-]/g, '').replace(/(?!^)-/g, '');
    
    // Mantener el valor de display
    setCostoDirectoDisplay(cleaned);
    
    // Si está vacío o solo es un guión, establecer valor numérico a 0
    if (cleaned === '' || cleaned === '-') {
      setEditedAmpliacionContrato((prev) => ({
        ...prev,
        valorCostoDirectoAdicional: 0,
      }));
      return;
    }
    
    const numericValue = parseInt(cleaned, 10);
    setEditedAmpliacionContrato((prev) => ({
      ...prev,
      valorCostoDirectoAdicional: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  const handleChangeGastosRembolsables = (rawInput: string) => {
    // Si el usuario escribe solo "-" y el input actual es "$0", permitirlo
    if (rawInput === '-') {
      setGastosRembolsablesDisplay('-');
      setEditedAmpliacionContrato((prev) => ({
        ...prev,
        valorGastosRembolsablesAdicional: 0,
      }));
      return;
    }
    
    // Permitir solo números y el signo negativo al inicio
    const cleaned = rawInput.replace(/[^\d-]/g, '').replace(/(?!^)-/g, '');
    
    // Mantener el valor de display
    setGastosRembolsablesDisplay(cleaned);
    
    // Si está vacío o solo es un guión, establecer valor numérico a 0
    if (cleaned === '' || cleaned === '-') {
      setEditedAmpliacionContrato((prev) => ({
        ...prev,
        valorGastosRembolsablesAdicional: 0,
      }));
      return;
    }
    
    const numericValue = parseInt(cleaned, 10);
    setEditedAmpliacionContrato((prev) => ({
      ...prev,
      valorGastosRembolsablesAdicional: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

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
              setEditedAmpliacionContrato({
                ...defaultAmpliacionContrato,
                contratoId: selectedContratoId
              });
              // Limpiar estados de display
              setCostoDirectoDisplay('');
              setGastosRembolsablesDisplay('');
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
                  <th className='min-w-150px rounded-start ps-5'>Costo Directo</th>
                  <th className='min-w-150px'>Gastos Reembolsables</th>
                  <th className='min-w-150px'>Valor Total</th>
                  <th className='min-w-150px'>Nueva Fecha Fin</th>
                  <th className='min-w-150px text-end rounded-end pe-5'>Acciones</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {shownAmpliacionesContrato.map((ampliacionContrato) => {
                  const valorTotal = ampliacionContrato.valorCostoDirectoAdicional + ampliacionContrato.valorGastosRembolsablesAdicional;
                  return (
                    <tr key={ampliacionContrato.id}>
                      <td>
                        <span className="d-block fs-6 ps-5">
                          {formatCurrency(ampliacionContrato.valorCostoDirectoAdicional)}
                        </span>
                      </td>
                      <td>
                        <span className="d-block fs-6">
                          {formatCurrency(ampliacionContrato.valorGastosRembolsablesAdicional)}
                        </span>
                      </td>
                      <td>
                        <span className="text-primary d-block fw-bold fs-6">
                          {formatCurrency(valorTotal)}
                        </span>
                      </td>
                      <td>
                        <span className="d-block fs-6">
                          {new Date(ampliacionContrato.nuevaFechaFin).toLocaleDateString('es-CO')}
                        </span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchAmpliacionContrato(ampliacionContrato.id)}>
                          <KTIcon iconName="pencil" className="fs-3" />
                        </button>
                        <button className="btn btn-icon btn-bg-light btn-active-light-danger ms-3" onClick={() => openDeleteModal(ampliacionContrato.id)}>
                          <KTIcon iconName="trash" className="fs-3" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        <Pagination
          filteredItems={filteredAmpliacionesContrato}
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
              <div className="d-flex flex-column gap-3">
                <div className="form-group">
                  <label className="form-label required"> Contrato </label>
                  <select
                    value={editedAmpliacionContrato.contratoId}
                    onChange={(e) => setEditedAmpliacionContrato(prev => ({ ...prev, contratoId: parseInt(e.target.value) }))}
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
                        <option value={0}>Seleccione un contrato</option>
                        {contratos.map((contrato) => (
                          <option key={contrato.id} value={contrato.id}>{contrato.numero}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required"> Nueva Fecha de Fin </label>
                  <input
                    type="date"
                    value={editedAmpliacionContrato.nuevaFechaFin ? new Date(editedAmpliacionContrato.nuevaFechaFin).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditedAmpliacionContrato(prev => ({ ...prev, nuevaFechaFin: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required"> Valor Costo Directo Adicional </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="-?[0-9]*[.,]?[0-9]*"
                    placeholder="Valor en pesos colombianos (COP) - Acepta valores negativos"
                    value={getDisplayValue('costoDirecto')}
                    onChange={(e) => handleChangeCostoDirecto(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required"> Valor Gastos Reembolsables Adicional </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="-?[0-9]*[.,]?[0-9]*"
                    placeholder="Valor en pesos colombianos (COP) - Acepta valores negativos"
                    value={getDisplayValue('gastosRembolsables')}
                    onChange={(e) => handleChangeGastosRembolsables(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createAmpliacionContrato(editedAmpliacionContrato);
              } else {
                updateAmpliacionContrato(editedAmpliacionContrato);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Caja de Confirmación de Eliminación */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content="¿Está seguro que desea eliminar esta orden de cambio?"
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteAmpliacionContrato}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}