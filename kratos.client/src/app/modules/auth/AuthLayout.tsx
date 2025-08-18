import {useEffect} from 'react'
import {Outlet} from 'react-router-dom'

import logoTop from '../../../app/assets/images/utilityCenitTop.png'
import logoBottom from '../../../app/assets/images/utilityCenitEcopetrol.png'
import utilityLeft from '../../../app/assets/images/utilityCenit10.png'
import utilityCenter from '../../../app/assets/images/utilityCenit13.png'
import utilityRight from '../../../app/assets/images/utilityCenit5.png'

import '../../SpecificStyles.scss'

const AuthLayout = () => {
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) {
      root.style.height = '100%'
    }
    return () => {
      if (root) {
        root.style.height = 'auto'
      }
    }
  }, [])

  return (
    <div className='d-flex flex-column flex-lg-row flex-column-fluid h-100'>
      <div className='d-flex flex-column flex-lg-row-fluid w-lg-50 order-2 order-lg-1' id='registration-form'
        style={{
          maxHeight: '100vh',
          scrollbarWidth: 'none', // Oculta la barra en Firefox
          msOverflowStyle: 'none' // Oculta la barra en Internet Explorer y Edge
        }}>
        <div className='d-flex flex-center flex-column flex-lg-row-fluid'>
          <div className='w-lg-500px p-20'>
            <Outlet />
            {/* Define el estado actual del Router de este modulo */}
            {/* Se debe definir en el componente principal del modulo */}
            {/* En esta parte se renderiza la subruta actual de este modulo */}
            {/* Todas las subrutas están definidas en el componente AuthPage */}
          </div>
        </div>
      </div>
      <div
        className='d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2'
        style={{background: 'linear-gradient(225deg, #028cfd, #010043)'}}
      >
        <div className='d-flex flex-column flex-center w-100'>
          <div className='d-flex w-100'>
            <img className='w-100px' src={logoTop} />
          </div>
          <div className='d-flex flex-center w-100 my-20'>
            <img className='h-300px mt-0' src={utilityLeft} />
            <img className='h-350px' style={{ marginLeft: '25px', marginRight: '20px' }} src={utilityCenter}/>
            <img className='h-300px mb-7' src={utilityRight} />
          </div>
          <h1 className='text-white fs-2qx fw-bolder text-center mb-5'>
            CENIT
          </h1>
          <div className='text-white fs-base text-center mb-20'>
            Sistema de gestión de contratos y ordenes de servicio
          </div>
          <div className='d-flex flex-end w-100'>
            <img className='w-200px' src={logoBottom} />
          </div>
        </div>
      </div>
    </div>
  )
}

export {AuthLayout}