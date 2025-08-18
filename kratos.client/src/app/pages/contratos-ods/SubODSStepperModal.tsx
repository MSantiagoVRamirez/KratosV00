import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Modal } from 'react-bootstrap'
import { defaultSubODSFormData, ISubODSFormData } from '../../interfaces/contratos-ods/SubODSFormData'
import { StepperComponent } from '../../../_metronic/assets/ts/components'
import { KTIcon } from '../../../_metronic/helpers'
import { Step1 } from './sub-ods-stepper/Step1'
import { Step2 } from './sub-ods-stepper/Step2'
import { Step3 } from './sub-ods-stepper/Step3'
import { Step4 } from './sub-ods-stepper/Step4'
import { ODS } from '../../interfaces/contratos-ods/ODS'
import { Planta } from '../../interfaces/contratos-ods/Planta'
import { Sistema } from '../../interfaces/contratos-ods/Sistema'

type Props = {
  show: boolean
  handleClose: () => void
  onSubmit: (ods: ODS) => void
  modalType: 'create' | 'edit'
  initialData?: ODS | null
  plantas: Planta[]
  sistemas: Sistema[]
  superODS: ODS[]
  selectedODSId?: number
}

const modalsRoot = document.getElementById('root-modals') || document.body

const SubODSStepperModal = ({ 
  show, 
  handleClose, 
  onSubmit, 
  modalType, 
  initialData, 
  plantas,
  sistemas,
  superODS,
  selectedODSId 
}: Props) => {
  const stepperRef = useRef<HTMLDivElement | null>(null)
  const [stepper, setStepper] = useState<StepperComponent | null>(null)
  const [data, setData] = useState<ISubODSFormData>(defaultSubODSFormData)
  const [hasError, setHasError] = useState(false)

  // Llenar datos iniciales para edición
  useEffect(() => {
    if (modalType === 'edit' && initialData) {
      setData({
        step1: {
          nombre: initialData.nombre,
          odsId: initialData.odsId,
          especialidad: initialData.especialidad,
          tipoODS: initialData.tipoODS,
          recurso: initialData.recurso,
          conexoObra: initialData.conexoObra || false
        },
        step2: {
          descripcion: initialData.descripcion,
          fechaInicio: initialData.fechaInicio,
          fechaFin: initialData.fechaFin || '',
          plazoEnDias: initialData.fechaInicio && initialData.fechaFin ? 
            Math.ceil((new Date(initialData.fechaFin).getTime() - new Date(initialData.fechaInicio).getTime()) / (1000 * 3600 * 24)) + 1 : null,
          listaPlanta: initialData.listaPlanta,
          listaSistema: initialData.listaSistema
        },
        step3: {
          valorHH: initialData.valorHH,
          valorViaje: initialData.valorViaje,
          valorEstudio: initialData.valorEstudio,
          valorGastoReembolsable: initialData.valorGastoReembolsable || 0
        }
      })
    } else {
      setData({
        ...defaultSubODSFormData,
        step1: {
          ...defaultSubODSFormData.step1,
          odsId: selectedODSId || null
        }
      })
    }
  }, [modalType, initialData, selectedODSId])

  // Asegurar que se muestre el Step 1 cuando el modal esté abierto y el stepper esté listo
  useEffect(() => {
    if (show && stepper) {
      setTimeout(() => {
        if ((stepper as any).refreshUI) {
          (stepper as any).refreshUI()
        }
        stepper.goto(1)
      }, 150)
    }
  }, [show, stepper])

  const loadStepper = () => {
    const stepperInstance = StepperComponent.createInsance(stepperRef.current as HTMLDivElement)
    if (stepperInstance) {
      setStepper(stepperInstance)
      
      setTimeout(() => {
        if ((stepperInstance as any).refreshUI) {
          (stepperInstance as any).refreshUI()
        }
        stepperInstance.goto(1)
      }, 100)
    } else {
      setStepper(stepperInstance)
    }
  }

  // Navegar directamente a un paso específico
  const goToStep = (stepIndex: number) => {
    if (!stepper) return
    stepper.goto(stepIndex)
  }

  const updateData = (fieldsToUpdate: Partial<ISubODSFormData>) => {
    const updatedData = { ...data, ...fieldsToUpdate }
    setData(updatedData)
  }

  // Validaciones por paso
  const checkStep1 = (): boolean => {
    if (!data.step1.nombre || data.step1.odsId === null || data.step1.especialidad === null) {
      return false
    }
    return true
  }

  const checkStep2 = (): boolean => {
    if (!data.step2.descripcion || !data.step2.fechaInicio || !data.step2.fechaFin || data.step2.plazoEnDias === null || data.step2.plazoEnDias <= 0) {
      return false
    }
    return true
  }

  const checkStep3 = (): boolean => {
    if (data.step3.valorHH <= 0 || data.step3.valorViaje < 0 || data.step3.valorEstudio < 0 || data.step3.valorGastoReembolsable < 0) {
      return false
    }
    return true
  }

  const prevStep = () => {
    if (!stepper) {
      return
    }
    stepper.goPrev()
  }

  const nextStep = () => {
    setHasError(false)
    if (!stepper) {
      return
    }

    const currentStep = stepper.getCurrentStepIndex()

    // Validaciones por paso
    if (currentStep === 1) {
      if (!checkStep1()) {
        setHasError(true)
        return
      }
    }

    if (currentStep === 2) {
      if (!checkStep2()) {
        setHasError(true)
        return
      }
    }

    if (currentStep === 3) {
      if (!checkStep3()) {
        setHasError(true)
        return
      }
    }

    stepper.goNext()
  }

  const submit = () => {
    // Obtener datos de la ODS padre para heredar algunos campos
    const odsPadre = superODS.find(ods => ods.id === data.step1.odsId);

    // Convertir datos del formulario a formato ODS
    const odsData: ODS = {
      id: modalType === 'edit' && initialData ? initialData.id : 0,
      nombre: data.step1.nombre,
      numeroSeguimientoCenit: modalType === 'edit' && initialData ? initialData.numeroSeguimientoCenit : '',
      numeroSeguimientoContratista: modalType === 'edit' && initialData ? initialData.numeroSeguimientoContratista : '',
      descripcion: data.step2.descripcion,
      contratoId: odsPadre?.contratoId || 0,
      contratista: odsPadre?.contratista || null,
      tipoODS: data.step1.tipoODS,
      valorHH: data.step3.valorHH,
      valorViaje: data.step3.valorViaje,
      valorEstudio: data.step3.valorEstudio,
      valorSumaGlobalFija: data.step3.valorHH + data.step3.valorViaje + data.step3.valorEstudio,
      valorInicialHH: data.step3.valorHH,
      valorInicialViaje: data.step3.valorViaje,
      valorInicialEstudio: data.step3.valorEstudio,
      valorInicialSumaGlobalFija: data.step3.valorHH + data.step3.valorViaje + data.step3.valorEstudio,
      valorGastoReembolsable: data.step3.valorGastoReembolsable,
      porcentajeGastoReembolsable: data.step3.valorGastoReembolsable,
      valorDisponible: modalType === 'edit' && initialData ? initialData.valorDisponible : data.step3.valorHH + data.step3.valorViaje + data.step3.valorEstudio,
      valorHabilitado: modalType === 'edit' && initialData ? initialData.valorHabilitado : 0,
      valorPagado: modalType === 'edit' && initialData ? initialData.valorPagado : 0,
      valorFaltaPorPagar: modalType === 'edit' && initialData ? initialData.valorFaltaPorPagar : 0,
      fechaInicio: data.step2.fechaInicio,
      fechaFinalOriginal: data.step2.fechaFin,
      fechaFin: data.step2.fechaFin,
      fechaRealCierre: modalType === 'edit' && initialData ? initialData.fechaRealCierre : null,
      porcentajeRequerimientosCumplidos: modalType === 'edit' && initialData ? initialData.porcentajeRequerimientosCumplidos : null,
      porcentajeAccionesCumplidas: modalType === 'edit' && initialData ? initialData.porcentajeAccionesCumplidas : null,
      horasHombre: modalType === 'edit' && initialData ? initialData.horasHombre : null,
      estaAprobada: modalType === 'edit' && initialData ? initialData.estaAprobada : false,
      estaCancelada: modalType === 'edit' && initialData ? initialData.estaCancelada : false,
      estaSuspendida: modalType === 'edit' && initialData ? initialData.estaSuspendida : false,
      estaRechazada: modalType === 'edit' && initialData ? initialData.estaRechazada : false,
      comentarioAprobacion: modalType === 'edit' && initialData ? initialData.comentarioAprobacion : null,
      estado: modalType === 'edit' && initialData ? initialData.estado : 0,
      avance: modalType === 'edit' && initialData ? initialData.avance : 0,
      plantaSistema: false,
      listaPlanta: data.step2.listaPlanta,
      listaSistema: data.step2.listaSistema,
      conexoObra: data.step1.conexoObra,
      odsId: data.step1.odsId,
      liderServicioId: odsPadre?.liderServicioId || null,
      supervisorTecnicoId: odsPadre?.supervisorTecnicoId || null,
      coordinadorODSId: odsPadre?.coordinadorODSId || 0,
      SyCcontratistaId: odsPadre?.SyCcontratistaId || null,
      especialidad: data.step1.especialidad,
      recurso: data.step1.recurso,
      areaSupervisionTecnica: odsPadre?.areaSupervisionTecnica || null,
      complejidad: odsPadre?.complejidad || null,
      paqueteModular: odsPadre?.paqueteModular || null
    }

    onSubmit(odsData)
    handleClose()
  }

  const handleModalClose = () => {
    setData(defaultSubODSFormData)
    setHasError(false)
    handleClose()
  }

  return createPortal(
    <Modal
      id='kt_modal_create_sub_ods'
      tabIndex={-1}
      aria-hidden='true'
      dialogClassName='modal-dialog modal-dialog-centered modal-xl'
      show={show}
      onHide={handleModalClose}
      onEntered={loadStepper}
      backdrop={true}
      style={{ '--bs-modal-height': '80vh' } as React.CSSProperties}
    >
      <div className='modal-header'>
        <h2>{modalType === 'create' ? 'Crear Servicio' : 'Editar Servicio'}</h2>
        <div className='btn btn-sm btn-icon btn-active-color-primary' onClick={handleModalClose}>
          <KTIcon className='fs-1' iconName='cross' />
        </div>
      </div>

      <div className='modal-body py-lg-5 px-lg-10' style={{ height: '70vh', overflow: 'hidden' }}>
        <div
          ref={stepperRef}
          className='stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid h-100'
          id='kt_modal_create_sub_ods_stepper'
        >
          {/* Navegación del Stepper */}
          <div className='d-flex justify-content-center justify-content-xl-start flex-row-auto w-100 w-xl-300px flex-shrink-0'>
            <div className='stepper-nav ps-lg-10'>
              {/* Paso 1 */}
              <div className='stepper-item current' data-kt-stepper-element='nav' onClick={() => goToStep(1)} style={{ cursor: 'pointer' }}>
                <div className='stepper-wrapper'>
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>1</span>
                  </div>
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Información Básica</h3>
                    <div className='stepper-desc'>Datos generales del servicio</div>
                  </div>
                </div>
                <div className='stepper-line h-40px'></div>
              </div>

              {/* Paso 2 */}
              <div className='stepper-item' data-kt-stepper-element='nav' onClick={() => goToStep(2)} style={{ cursor: 'pointer' }}>
                <div className='stepper-wrapper'>
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>2</span>
                  </div>
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Cronograma y Ubicación</h3>
                    <div className='stepper-desc'>Fechas y estaciones</div>
                  </div>
                </div>
                <div className='stepper-line h-40px'></div>
              </div>

              {/* Paso 3 */}
              <div className='stepper-item' data-kt-stepper-element='nav' onClick={() => goToStep(3)} style={{ cursor: 'pointer' }}>
                <div className='stepper-wrapper'>
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>3</span>
                  </div>
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Valores</h3>
                    <div className='stepper-desc'>Presupuesto y costos</div>
                  </div>
                </div>
                <div className='stepper-line h-40px'></div>
              </div>

              {/* Paso 4 */}
              <div className='stepper-item' data-kt-stepper-element='nav' onClick={() => goToStep(4)} style={{ cursor: 'pointer' }}>
                <div className='stepper-wrapper'>
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>4</span>
                  </div>
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Revisión</h3>
                    <div className='stepper-desc'>Confirmar y enviar</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido de los pasos */}
          <div className='flex-row-fluid py-lg-5 px-lg-15 d-flex flex-column'>
            <form noValidate id='kt_modal_create_sub_ods_form' className='d-flex flex-column h-100'>
              <div className='flex-grow-1 overflow-auto' style={{ maxHeight: 'calc(70vh - 120px)' }}>
                <Step1 
                  data={data} 
                  updateData={updateData} 
                  hasError={hasError} 
                  selectedODSId={selectedODSId}
                  superODS={superODS}
                />
                <Step2 
                  data={data} 
                  updateData={updateData} 
                  hasError={hasError} 
                  plantas={plantas}
                  sistemas={sistemas}
                />
                <Step3 
                  data={data} 
                  updateData={updateData} 
                  hasError={hasError} 
                />
                <Step4 
                  data={data} 
                  superODS={superODS}
                />
              </div>

              {/* Botones de navegación */}
              <div className='d-flex flex-stack pt-5 flex-shrink-0 border-top'>
                <div className='me-2'>
                  <button
                    type='button'
                    className='btn btn-lg btn-light-primary me-3'
                    data-kt-stepper-action='previous'
                    onClick={prevStep}
                  >
                    <KTIcon iconName='arrow-left' className='fs-3 me-1' /> Anterior
                  </button>
                </div>
                <div>
                  <button
                    type='button'
                    className='btn btn-lg btn-primary'
                    data-kt-stepper-action='submit'
                    onClick={submit}
                  >
                    {modalType === 'create' ? 'Crear Servicio' : 'Actualizar Servicio'} 
                    <KTIcon iconName='arrow-right' className='fs-3 ms-2 me-0' />
                  </button>

                  <button
                    type='button'
                    className='btn btn-lg btn-primary'
                    data-kt-stepper-action='next'
                    onClick={nextStep}
                  >
                    Siguiente <KTIcon iconName='arrow-right' className='fs-3 ms-1 me-0' />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Modal>,
    modalsRoot
  )
}

export { SubODSStepperModal } 