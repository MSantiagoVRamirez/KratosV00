import {FC} from 'react'
import {UsuarioDataForm} from '../../../../interfaces/seguridad/UsuarioDataForm'

type Props = {
  data: UsuarioDataForm
  updateData: (fieldsToUpdate: Partial<UsuarioDataForm>) => void
  hasError: boolean
}

export const Step1: FC<Props> = ({data, updateData}) => {
  const seleccionar = (tipo: 'cliente' | 'empleado') => {
    const token = tipo === 'cliente' ? '123456789' : data.step1.token
    updateData({tipoUsuario: tipo, step1: {...data.step1, token}})
  }

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      <div style={{  marginLeft: '28%', marginTop: '2%'}}>
        <div style={{  borderRadius: "5%",  backgroundColor: "rgb(235, 235, 243)", padding: "5rem",  width: '800 px', textAlign: 'center'}}>
          <h4 style={{color: 'rgb(18, 30, 130)', }} className='mb-6'>¿Como deseas registrarte?</h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap'}}>
            <button type='button' className='boton-formulario' onClick={()=>seleccionar('cliente')}>Cliente</button>
            <button type='button' className='boton-formulario' onClick={()=>seleccionar('empleado')}>Empleado</button>
          </div>
          {data.tipoUsuario && (
            <div className='mt-6'>
              Seleccionado: <strong>{data.tipoUsuario}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
