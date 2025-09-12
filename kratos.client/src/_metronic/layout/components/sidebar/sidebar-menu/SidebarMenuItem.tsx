import {FC} from 'react'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {useLocation} from 'react-router'
import {checkIsActive, KTIcon, WithChildren} from '../../../../helpers'
import {useLayout} from '../../../core'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
}

const SidebarMenuItem: FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet = false,
}) => {
  const {pathname} = useLocation()
  const isActive = checkIsActive(pathname, to)
  const {config} = useLayout()
  const {app} = config

  return (
    <div className='menu-item'>
      <Link  className={clsx('menu-link without-sub', {active: isActive})} to={to}>
        {hasBullet && (
          <span  className='menu-bullet'>
            <span className='bullet bullet-dot'></span>
          </span>
        )}
        {/* Mostrar solo iconos de fuente y en color blanco */}
        {fontIcon && (
          <i className={clsx('bi fs-3', fontIcon)} style={{color: 'white'}}></i>
        )}
        <span style={{color: 'White'}}  className='menu-title'>{title}</span>
      </Link>
      {children}
    </div>
  )
}

export {SidebarMenuItem}
