import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Modal } from 'react-bootstrap'
import { defaultTallerFormData, ITallerFormData } from '../../interfaces/talleres-hallazgos/TallerFormData'
import { StepperComponent } from '../../../_metronic/assets/ts/components'
import { KTIcon } from '../../../_metronic/helpers'
import { Step1 } from './taller-stepper/Step1'
import { Step2 } from './taller-stepper/Step2'
import { Step3 } from './taller-stepper/Step3'
import { Step4 } from './taller-stepper/Step4'
import { Taller } from '../../interfaces/talleres-hallazgos/Taller'
import { ODS } from '../../interfaces/contratos-ods/ODS'
import { TipoTaller } from '../../interfaces/talleres-hallazgos/TipoTaller'
import { Empresa } from '../../interfaces/seguridad/Empresa'
import { HitoPago } from '../../interfaces/contratos-ods/HitoPago'

type Props = {
  show: boolean
  handleClose: () => void
  onSubmit: (taller: Taller) => void
  modalType: 'create' | 'edit'
  initialData?: Taller | null
  selectedODSId?: number
  ordenesServicio: ODS[]
  tiposTaller: TipoTaller[]
  empresas: Empresa[]
  hitosDePago: HitoPago[]
}

const modalsRoot = document.getElementById('root-modals') || document.body

const TallerStepperModal = ({ 
  show, 
  handleClose, 
  onSubmit, 
  modalType, 
  initialData, 
  selectedODSId,
  ordenesServicio,
  tiposTaller,
  empresas,
  hitosDePago
}: Props) => {
  const stepperRef = useRef<HTMLDivElement | null>(null)
  const [stepper, setStepper] = useState<StepperComponent | null>(null)
  const [data, setData] = useState<ITallerFormData>(defaultTallerFormData)
  const [hasError, setHasError] = useState(false)

  // Llenar datos iniciales para edición
  useEffect(() => {
    if (modalType === 'edit' && initialData) {
      setData({
        step1: {
          fecha: initialData.fecha,
          odsId: initialData.odsId,
          tipoId: initialData.tipoId
        },
        step2: {
          consultorId: initialData.consultorId,
          proyecto: initialData.proyecto,
          liderProyecto: initialData.liderProyecto,
          hitoPagoId: initialData.hitoPagoId
        },
        step3: {
          ejerciciosPrevios: initialData.ejerciciosPrevios,
          comentarios: initialData.comentarios
        }
      })
    } else {
      setData({
        ...defaultTallerFormData,
        step1: {
          ...defaultTallerFormData.step1,
          odsId: selectedODSId || 0
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

  const updateData = (fieldsToUpdate: Partial<ITallerFormData>) => {
    const updatedData = { ...data, ...fieldsToUpdate }
    setData(updatedData)
  }

  // Validaciones por paso
  const checkStep1 = (): boolean => {
    if (!data.step1.fecha || data.step1.odsId === 0 || data.step1.tipoId === 0) {
      return false
    }
    return true
  }

  const checkStep2 = (): boolean => {
    if (!data.step2.proyecto || !data.step2.liderProyecto || data.step2.hitoPagoId === 0) {
      return false
    }
    return true
  }

  const checkStep3 = (): boolean => {
    // Este paso es opcional, siempre válido
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
    const selectedODS = ordenesServicio.find(ods => ods.id === data.step1.odsId)
    const contratista = selectedODS?.contratista || ''
    const idContratista = empresas.find(empresa => empresa.nombre === contratista)?.id || 0
    // Convertir datos del formulario a formato Taller
    const tallerData: Taller = {
      id: modalType === 'edit' && initialData ? initialData.id : 0,
      nombre: modalType === 'edit' && initialData ? initialData.nombre : 'T000', // Se asigna automáticamente
      fecha: data.step1.fecha,
      odsId: data.step1.odsId,
      tipoId: data.step1.tipoId,
      consultorId: idContratista,
      proyecto: data.step2.proyecto,
      liderProyecto: data.step2.liderProyecto,
      hitoPagoId: data.step2.hitoPagoId,
      ejerciciosPrevios: data.step3.ejerciciosPrevios,
      comentarios: data.step3.comentarios,
      // Campos predeterminados para crear
      avanceTipo1: modalType === 'edit' && initialData ? initialData.avanceTipo1 : 0,
      avanceTipo2: modalType === 'edit' && initialData ? initialData.avanceTipo2 : 0,
      avanceTipo3: modalType === 'edit' && initialData ? initialData.avanceTipo3 : 0,
      estado: modalType === 'edit' && initialData ? initialData.estado : 0, // Pendiente
      estaAprobado: modalType === 'edit' && initialData ? initialData.estaAprobado : false,
      estaCancelado: modalType === 'edit' && initialData ? initialData.estaCancelado : false,
      estaRechazado: modalType === 'edit' && initialData ? initialData.estaRechazado : false,
      estaFirmado: modalType === 'edit' && initialData ? initialData.estaFirmado : false,
      comentarioAprobacion: modalType === 'edit' && initialData ? initialData.comentarioAprobacion : null,
      nombreFirma: modalType === 'edit' && initialData ? initialData.nombreFirma : null,
      fechaFirma: modalType === 'edit' && initialData ? initialData.fechaFirma : null
    }

    console.log('Taller data to submit:', tallerData)
    onSubmit(tallerData)
    handleClose()
  }

  const handleModalClose = () => {
    setData(defaultTallerFormData)
    setHasError(false)
    handleClose()
  }

  return createPortal(
    <Modal
      id='kt_modal_create_taller'
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
        <h2>{modalType === 'create' ? 'Crear Taller' : 'Editar Taller'}</h2>
        <div className='btn btn-sm btn-icon btn-active-color-primary' onClick={handleModalClose}>
          <KTIcon className='fs-1' iconName='cross' />
        </div>
      </div>

      <div className='modal-body py-lg-5 px-lg-10' style={{ height: '70vh', overflow: 'hidden' }}>
        <div
          ref={stepperRef}
          className='stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid h-100'
          id='kt_modal_create_taller_stepper'
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
                    <div className='stepper-desc'>Fecha, ODS y tipo</div>
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
                    <h3 className='stepper-title'>Asignaciones</h3>
                    <div className='stepper-desc'>Proyecto y responsables</div>
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
                    <h3 className='stepper-title'>Información Adicional</h3>
                    <div className='stepper-desc'>Ejercicios y comentarios</div>
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
            <form noValidate id='kt_modal_create_taller_form' className='d-flex flex-column h-100'>
              <div className='flex-grow-1 overflow-auto' style={{ maxHeight: 'calc(70vh - 120px)' }}>
                <Step1 
                  data={data} 
                  updateData={updateData} 
                  hasError={hasError} 
                  selectedODSId={selectedODSId}
                  ordenesServicio={ordenesServicio}
                  tiposTaller={tiposTaller}
                />
                <Step2 
                  data={data} 
                  updateData={updateData} 
                  hasError={hasError} 
                  empresas={empresas}
                  hitosDePago={hitosDePago}
                  ordenesServicio={ordenesServicio}
                />
                <Step3 
                  data={data} 
                  updateData={updateData} 
                  hasError={hasError} 
                />
                <Step4 
                  data={data} 
                  ordenesServicio={ordenesServicio}
                  tiposTaller={tiposTaller}
                  empresas={empresas}
                  hitosDePago={hitosDePago}
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
                    {modalType === 'create' ? 'Crear Taller' : 'Actualizar Taller'} 
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

export { TallerStepperModal } 