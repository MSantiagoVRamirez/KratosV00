import { useState, useEffect } from "react"
import { SPI } from "../../interfaces/secs/SPI"
import { ODS } from "../../interfaces/contratos-ods/ODS"
import spiService from "../../services/secs/spiService"
import odsService from "../../services/contratos-ods/odsService"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAuth } from "../../modules/auth/AuthContext"

export function SPIWidget({ selectedODSId, onUpdate }: { selectedODSId: number, onUpdate?: () => void }) {

  const { role } = useAuth();
  const currentRole = role || '';
  const esOriginador = currentRole === 'Administrador' || currentRole === 'Funcionario Contratista';
  const esAprobador = currentRole === 'Administrador' || currentRole === 'Funcionario Cenit';

  const defaultSPI: SPI = {
    id: 0,
    odsId: selectedODSId,
    fecha: new Date().toISOString().split('T')[0],
    spi: 0,
    estaAprobado: false
  }
  
  const [spis, setSPIs] = useState<SPI[]>([])
  const [editedSPI, setEditedSPI] = useState<SPI>(defaultSPI)
  const [deleteSPIId, setDeleteSPIId] = useState<number>(defaultSPI.id)

  const [ordenesServicio, setOrdenesServicio] = useState<ODS[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    odsId: { value: editedSPI.odsId, required: true, type: 'number' },
    fecha: { value: editedSPI.fecha, required: true, type: 'string' },
    spi: { value: editedSPI.spi, required: true, type: 'number' },
    estaAprobado: { value: editedSPI.estaAprobado, required: false, type: 'boolean' },
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

  const fetchSPIs = () => {
    spiService.getAll()
      .then((response) => {
        if (response.data.length !== 0) {
          setSPIs(response.data)
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los SPIs", error)
      })
  }

  useEffect(() => {
    fetchOrdenesServicio()
    fetchSPIs()
  }, [selectedODSId])

  useEffect(() => {
    setEditedSPI({
      ...defaultSPI,
      odsId: selectedODSId || 0
    });
  }, [selectedODSId]);

  const fetchSPI = (id: number) => {
    spiService.get(id)
      .then((response) => {
        setEditedSPI(response.data)
        setModalType('edit')
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el SPI", error)
      })
  }

  const createSPI = (data: SPI) => {
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    spiService.create(dataToSend)
      .then(() => {
        setEditedSPI(defaultSPI)
        alert("SPI creado exitosamente")
        closeModal()
        fetchSPIs()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al crear el SPI", error)
        alert(`Error al crear SPI: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const updateSPI = (data: SPI) => {
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    spiService.update(dataToSend)
      .then(() => {
        setEditedSPI(defaultSPI)
        alert("SPI actualizado exitosamente")
        closeModal()
        fetchSPIs()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el SPI", error)
        alert(`Error al actualizar SPI: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const deleteSPI = () => {
    spiService.remove(deleteSPIId)
      .then(() => {
        setDeleteSPIId(defaultSPI.id)
        alert("SPI eliminado exitosamente")
        closeModal()
        fetchSPIs()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el SPI", error)
        alert(`Error al eliminar SPI: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const openDeleteModal = (id: number) => {
    setDeleteSPIId(id)
    setModalType('delete')
  }

  const filteredSPIsByODS = spis.filter(spi => spi.odsId === selectedODSId)

  const filteredSPIs = filteredSPIsByODS.filter(spi => {
    const ods = ordenesServicio.find(o => o.id === spi.odsId);
    const searchTermLower = searchTerm.toLowerCase();

    return (
      ods?.nombre.toLowerCase().includes(searchTermLower) ||
      spi.fecha.toLowerCase().includes(searchTermLower) ||
      spi.spi.toString().includes(searchTermLower)
    );
  })

  const applyPagination = (data: SPI[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage)
    return paginatedItems
  }

  const shownSPIs = applyPagination(filteredSPIs)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  }

  const getSPIStatus = (spiValue: number) => {
    if (spiValue >= 1.0) return { status: 'Adelantado', color: 'success' };
    if (spiValue >= 0.9) return { status: 'En Tiempo', color: 'primary' };
    if (spiValue >= 0.8) return { status: 'Retrasado', color: 'warning' };
    return { status: 'Crítico', color: 'danger' };
  }

  const formatSPI = (spiValue: number) => {
    return spiValue.toFixed(2);
  }

  return (
    <>
      <div className="card mx-10 my-10 mx-0-sm">
        <div className="card-header">
          <div className="card-title fw-bold fs-2">Índice de Rendimiento de Cronograma (SPI)</div>
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
              setEditedSPI({
                ...defaultSPI,
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
                  <th className='min-w-100px'>Valor SPI</th>
                  <th className='min-w-150px'>Estado</th>
                  <th className='min-w-100px'>Aprobado</th>
                  <th className='min-w-150px text-end rounded-end pe-5'>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shownSPIs.map((spi) => {
                  const spiStatus = getSPIStatus(spi.spi);
                  return (
                    <tr key={spi.id}>
                      <td>
                        <span className="fs-6 fw-bold ps-5">
                          {formatDate(spi.fecha)}
                        </span>
                      </td>
                      <td>
                        <span className="fs-5 fw-bold text-primary">
                          {formatSPI(spi.spi)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-light-${spiStatus.color} fs-7 fw-bold`}>
                          {spiStatus.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-light-${spi.estaAprobado ? 'success' : 'warning'} fs-7 fw-bold`}>
                          {spi.estaAprobado ? 'Aprobado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => fetchSPI(spi.id)}>
                          <KTIcon iconName="pencil" className="fs-3" />
                        </button>
                        <button className="btn btn-icon btn-bg-light btn-active-light-danger ms-3" onClick={() => openDeleteModal(spi.id)}>
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
          filteredItems={filteredSPIs}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar SPI" : "Editar SPI"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-5">
                <div className="form-group">
                  <label className="form-label required">Orden de Servicio</label>
                  <select
                    value={editedSPI.odsId}
                    onChange={(e) => setEditedSPI(prev => ({ ...prev, odsId: parseInt(e.target.value) }))}
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
                    value={editedSPI.fecha}
                    onChange={(e) => setEditedSPI(prev => ({ ...prev, fecha: e.target.value }))}
                    className="form-control"
                    disabled={!esOriginador}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Valor SPI</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="2"
                    value={editedSPI.spi}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                      setEditedSPI(prev => ({ ...prev, spi: value }));
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
                    required
                  />
                  <div className="form-text text-muted">
                    <strong>Interpretación:</strong><br/>
                    • ≥ 1.0: Adelantado (verde)<br/>
                    • 0.9 - 0.99: En Tiempo (azul)<br/>
                    • 0.8 - 0.89: Retrasado (amarillo)<br/>
                    • &lt; 0.8: Crítico (rojo)
                  </div>
                </div>
                <div className="alert alert-info d-flex align-items-center p-5">
                  <KTIcon iconName="information-5" className="fs-2hx text-info me-4" />
                  <div className="d-flex flex-column">
                    <span className="fw-bold">SPI Actual: {formatSPI(editedSPI.spi)}</span>
                    <span className="fs-7">Estado: {getSPIStatus(editedSPI.spi).status}</span>
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="estaAprobado"
                      checked={editedSPI.estaAprobado}
                      onChange={(e) => setEditedSPI(prev => ({ ...prev, estaAprobado: e.target.checked }))}
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
                createSPI(editedSPI);
              } else {
                updateSPI(editedSPI);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {modalType === 'delete' && (
          <ModalDialog
            title="Eliminar SPI"
            content="¿Estás seguro de que deseas eliminar este registro de SPI? Esta acción no se puede deshacer."
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteSPI}
            closeModal={closeModal}
          />
        )}
      </div>
    </>
  )
}