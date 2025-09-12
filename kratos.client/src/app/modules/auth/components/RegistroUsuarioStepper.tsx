import {createPortal} from 'react-dom'
import {Modal} from 'react-bootstrap'
import {StepperComponent} from '../../../../_metronic/assets/ts/components'
import {KTIcon} from '../../../../_metronic/helpers'
import {defaultDataUsuario, UsuarioDataForm} from '../../../interfaces/seguridad/UsuarioDataForm'
import {Step1} from './Stepper-Usuario/Step1'
import {Step2} from './Stepper-Usuario/Step2'
import {StepPersonal} from './Stepper-Usuario/StepPersonal'
import {Step4} from './Stepper-Usuario/Step4'
import '../../../Styles/estilos.css'
import {useRef, useState, useEffect} from 'react'

type Props = {
  show: boolean
  handleClose: () => void
  onSubmit: (data: {
    email: string
    contraseña: string
    confirmarContraseña: string
    token: string
    nombres: string
    apellidos: string
    telefono: string
    rolesId: number
    imagenFile?: File | null
  }) => void
}

const modalsRoot = document.getElementById('root-modals') || document.body

export function RegistroUsuarioStepper({show, handleClose, onSubmit}: Props) {
  const stepperRef = useRef<HTMLDivElement | null>(null)
  const [stepper, setStepper] = useState<StepperComponent | null>(null)
  const [data, setData] = useState<UsuarioDataForm>(defaultDataUsuario)
  const [hasError, setHasError] = useState(false)

  const loadStepper = () => {
    const inst = StepperComponent.createInsance(stepperRef.current as HTMLDivElement)
    if (inst) {
      setStepper(inst)
      setTimeout(() => {
        if ((inst as any).refreshUI) (inst as any).refreshUI()
        inst.goto(1)
      }, 100)
    }
  }

  useEffect(() => {
    if (show && stepper) setTimeout(() => stepper.goto(1), 120)
  }, [show, stepper])

  const goToStep = (i: number) => stepper?.goto(i)
  const updateData = (fields: Partial<UsuarioDataForm>) => setData({...data, ...fields})

  const checkStep1 = () => !!(data.tipoUsuario)
  const checkStep2 = () => !!(data.step1.email && data.step1.contraseña && data.step1.confirmarContraseña && (data.step1.token || data.tipoUsuario === 'cliente'))
  const checkStep3 = () => !!(data.step2.nombres && data.step2.apellidos && data.step2.telefono)

  const nextStep = () => {
    if (!stepper) return
    const c = stepper.currentStepIndex
    const ok = c === 1 ? checkStep1() : c === 2 ? checkStep2() : c === 3 ? checkStep3() : true
    setHasError(!ok)
    if (ok) stepper.goNext()
  }
  const prevStep = () => stepper?.goPrev()

  const submit = () => {
    const payload = {
      email: data.step1.email,
      contraseña: data.step1.contraseña,
      confirmarContraseña: data.step1.confirmarContraseña,
      token: data.step1.token,
      nombres: data.step2.nombres,
      apellidos: data.step2.apellidos,
      telefono: data.step2.telefono,
      rolesId: data.step2.rolesId,
      imagenFile: data.step4?.imagenFile ?? null,
    }
    onSubmit(payload)
    handleClose()
  }

  const handleModalClose = () => {
    setData(defaultDataUsuario)
    setHasError(false)
    handleClose()
  }

  return createPortal(
    <Modal
      id='kt_modal_create_user'
      tabIndex={-1}
      aria-hidden='true'
      dialogClassName='modal-dialog modal-dialog-centered modal-xl'
      show={show}
      onHide={handleModalClose}
      onEntered={loadStepper}
      backdrop={true}
      style={{'--bs-modal-height': '80vh'} as React.CSSProperties}
    >
      <div className='modal-header'>
        <div className='modal-title' style={{scale: '1.7', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
          <h2>Registrar Usuario</h2>
        </div>
        <div className='btn btn-sm btn-icon btn-active-color-primary' onClick={handleModalClose}>
          <KTIcon className='fs-1' iconName='cross' />
        </div>
      </div>

      <div className='modal-body py-lg-5 px-lg-10' style={{height: '70vh', overflow: 'hidden'}}>
        <div ref={stepperRef} className='stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid h-100'>
          {/* NavegaciÃ³n Stepper */}
          <div className='d-flex justify-content-center justify-content-center flex-row-auto w-100 w-xl-300px flex-shrink-0'>
            <div className='stepper-nav ps-lg-10'>
              <div className='stepper-item current' data-kt-stepper-element='nav' onClick={() => goToStep(1)} style={{cursor: 'pointer'}}>
                <div className='stepper-wrapper'>
                  <div className='stepper-icon w-40px h-40px'>
                    <i style={{color: 'white'}} className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>1</span>
                  </div>
                  <div className='stepper-label'>
                    <h3 style={{color: 'rgb(255, 255 , 255)'}} className='stepper-title'>Tipo de Registro</h3>
                  </div>
                </div>
                <div className='stepper-line h-40px'></div>
              </div>
              <div className='stepper-item' data-kt-stepper-element='nav' onClick={() => goToStep(2)} style={{cursor: 'pointer'}}>
                <div className='stepper-wrapper'>
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>2</span>
                  </div>
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Credenciales</h3>
                  </div>
                </div>
                <div className='stepper-line h-40px'></div>
              </div>
              <div className='stepper-item' data-kt-stepper-element='nav' onClick={() => goToStep(3)} style={{cursor: 'pointer'}}>
                <div className='stepper-wrapper'>
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>3</span>
                  </div>
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Datos Personales</h3>
                  </div>
                </div>
                 <div className='stepper-line h-40px'></div>
              </div>
              <div className='stepper-item' data-kt-stepper-element='nav' onClick={() => goToStep(4)} style={{cursor: 'pointer'}}>
                <div className='stepper-wrapper'>
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>4</span>
                  </div>
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Imagen y Resumen</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido de los pasos */}
          <div className='flex-row-fluid py-lg-5 px-lg-15 d-flex flex-column'>
            <form noValidate className='d-flex flex-column h-100'>
              <div className='flex-grow-1 overflow-auto' style={{marginLeft: '1%', scale: '1.2', maxHeight: 'calc(70vh - 120px)'}}>
                <Step1 data={data} updateData={updateData} hasError={hasError} />
                <Step2 data={data} updateData={updateData} hasError={hasError} />
                <StepPersonal data={data} updateData={updateData} hasError={hasError} />
                <Step4 data={data} updateData={updateData} />
              </div>

              {/* Botones navegaciÃ³n */}
              <div className='d-flex flex-stack pt-5 flex-shrink-0 border-top'>
                <div className='me-2'>
                  <button type='button' className='btn boton-formulario btn-lg me-3' data-kt-stepper-action='previous' onClick={prevStep}>
                    <KTIcon iconName='arrow-left' className='fs-3 me-1' /> Anterior
                  </button>
                </div>
                <div>
                  <button type='button' className='btn boton-formulario btn-lg' data-kt-stepper-action='submit' onClick={submit}>
                    Registrar Usuario <KTIcon iconName='arrow-right' className='fs-3 ms-2 me-0' />
                  </button>
                  <button type='button' className='btn boton-formulario btn-lg' data-kt-stepper-action='next' onClick={nextStep}>
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

