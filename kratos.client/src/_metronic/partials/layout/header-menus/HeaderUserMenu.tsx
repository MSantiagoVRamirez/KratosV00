
import { FC } from 'react'
// import {Link} from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { KTIcon, toAbsoluteUrl } from '../../../helpers'
import authService from '../../../../app/services/seguridad/authService'
import { useAuth } from '../../../../app/modules/auth/AuthContext'

const HeaderUserMenu: FC = () => {
  const { invertAuth, clearSession, user, role, empresaNombre, avatarUrl } = useAuth()
  const navigate = useNavigate()
  const avatarSrc = avatarUrl || toAbsoluteUrl('media/avatars/blank.png')
  const username = user || 'Usuario' // Aseguramos que el nombre de usuario esté presente
  const userrole = role || 'Rol' // Aseguramos que el rol esté presente

  const logout = () => {
    authService.logout()
      .then(() => {
        clearSession()
        // invertAuth()
        navigate('landing')
      })
      .catch((error) => {
        console.error('Hubo un error al cerrar sesión', error)
      })
  }
  return (
    <div
      className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px'
      data-kt-menu='true'
    >
      <div className='menu-item px-3'>
        <div className='menu-content d-flex align-items-center px-3'>
          <div className='symbol symbol-50px me-5'>
            <img alt='Avatar' src={avatarSrc} />
          </div>

          <div className='d-flex flex-column'>
            <div className='fw-bolder d-flex align-items-center fs-5'>
              {username}
              {/* <span className='badge badge-light-success fw-bolder fs-8 px-2 py-1 ms-2'>Pro</span> */}
            </div>
            <span className='fw-semibold text-muted fs-7'>
              {userrole}{empresaNombre ? ` · ${empresaNombre}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* <div className='separator my-2'></div> */}

      {/* <div className='menu-item px-5'>
        <Link to={'/crafted/pages/profile'} className='menu-link px-5'>
          Mi perfil
        </Link>
      </div> */}

      {/* <div className='menu-item px-5'>
        <a href='#' className='menu-link px-5'>
          <span className='menu-text'>Mis Proyectos</span>
          <span className='menu-badge'>
            <span className='badge badge-light-danger badge-circle fw-bolder fs-7'>3</span>
          </span>
        </a>
      </div> */}

      {/* <div
        className='menu-item px-5'
        data-kt-menu-trigger='hover'
        data-kt-menu-placement='left-start'
        data-kt-menu-flip='bottom'
      >

        <div className='menu-sub menu-sub-dropdown w-175px py-4'>

          <div className='separator my-2'></div>

          <div className='menu-item px-3'>
            <div className='menu-content px-3'>
              <label className='form-check form-switch form-check-custom form-check-solid'>
                <input
                  className='form-check-input w-30px h-20px'
                  type='checkbox'
                  value='1'
                  defaultChecked={true}
                  name='notifications'
                />
                <span className='form-check-label text-muted fs-7'>Notificaciones</span>
              </label>
            </div>
          </div>
        </div>
      </div> */}

      {/* <div className='separator my-2'></div> */}

      {/* <div className='menu-item px-5 my-1'>
        <Link to='/crafted/account/settings' className='menu-link px-5'>
          Configuración
        </Link>
      </div> */}

      <div className='menu-item px-5'>
        <a onClick={logout} className='menu-link px-5 gap-3'>
          Cerrar Sesión
          <KTIcon iconName='exit-right' className='fs-2' />
        </a>
      </div>
    </div>
  )
}

export { HeaderUserMenu }
