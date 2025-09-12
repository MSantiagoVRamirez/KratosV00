import {useIntl} from 'react-intl'
import {MenuItem} from './MenuItem'
import {MenuInnerWithSub} from './MenuInnerWithSub'
import {MegaMenu} from './MegaMenu'
import {useAuth} from '../../../../../app/modules/auth/AuthContext'

export function MenuInner() {
  const intl = useIntl()
  const {isAuth, tipoLogin, roleId} = useAuth()
  const isEmpresa = isAuth && tipoLogin === 'empresa'
  const isUsuarioHome = roleId === 1
  const tipeEmpresa =  tipoLogin === 'empresa'
  return (
    <>
    {tipeEmpresa &&(
         <MenuItem title="Home" to='/dashboard' />
    )}
     
      {isUsuarioHome && (
        <MenuItem to='/usuarios/home' title='home' fontIcon='bi-people' hasBullet />
      )}

      {/* Configuración (solo empresa) */}
      {isEmpresa && (
        <MenuInnerWithSub to='/seguridad' title='Configuración' fontIcon='bi-gear' menuTrigger="{default:'click', lg: 'hover'}" menuPlacement='bottom-start'>
          <MenuItem to='/seguridad/empresa-widget' title='Perfil' fontIcon='bi-building' hasBullet />
          <MenuItem to='/seguridad/roles-widget' title='Roles' fontIcon='bi-person-badge' hasBullet />
          <MenuItem to='/seguridad/permisos-widget' title='Permisos' fontIcon='bi-key' hasBullet />
          <MenuItem to='/seguridad/usuarios-widget' title='Usuarios' fontIcon='bi-people' hasBullet />
          <MenuItem to='/ventas/punto-venta-widget' title='Sucursales' fontIcon='bi-shop' hasBullet />
        </MenuInnerWithSub>
      )}

      {/* Inventario */}
      <MenuInnerWithSub to='/inventario' title='Inventario' fontIcon='bi-box' menuTrigger="{default:'click', lg: 'hover'}" menuPlacement='bottom-start'>
        <MenuItem to='/ventas/registro-producto-widget' title='Regitro Productos' fontIcon='bi-box' hasBullet />
        <MenuItem to='/ventas/registro-servicio-widget' title='Registro Servicios' fontIcon='bi-tools' hasBullet />
        <MenuItem to='/inventario/Stock-Productos-widget' title='Stock Productos' fontIcon='bi-clipboard-data' hasBullet />
        <MenuItem to='/inventario/Agenda-Servicios-widget' title='Stock Servicios' fontIcon='bi-clipboard-check' hasBullet />
      </MenuInnerWithSub>

      {/* Ventas */}
      <MenuInnerWithSub to='/ventas' title='Ventas' fontIcon='bi-cart' menuTrigger="{default:'click', lg: 'hover'}" menuPlacement='bottom-start'>
        <MenuItem to='/ventas/ventas-widget' title='Ventas' fontIcon='bi-receipt' hasBullet />
        <MenuItem to='/ventas/POS' title='POS' fontIcon='bi-cash' hasBullet />
      </MenuInnerWithSub>

      {/* Compras */}
      <MenuInnerWithSub to='/compras' title='Compras' fontIcon='bi-bag' menuTrigger="{default:'click', lg: 'hover'}" menuPlacement='bottom-start'>
        <MenuItem to='/compras/compras-widget' title='Compras' fontIcon='bi-bag-check' hasBullet />
        <MenuItem to='/ventas/orden-compra-Widget' title='Ordenes de Compra' fontIcon='bi-clipboard-check' hasBullet />
        <MenuItem to='/ventas/proveedores-widget' title='Proveedores' fontIcon='bi-truck' hasBullet />
        <MenuItem to='/ventas/recepcion-productos-widget' title='Resepcion de Productos' fontIcon='bi-box-arrow-in-down' hasBullet />
      </MenuInnerWithSub>

      {/* Catalogo */}
      <MenuInnerWithSub to='/Catalogo' title='Catalogo' fontIcon='bi-grid' menuTrigger="{default:'click', lg: 'hover'}" menuPlacement='bottom-start'>
        <MenuItem to='/vitrina/ofertas-widget' title='Ofertas' fontIcon='bi-tags' hasBullet />
        <MenuItem to='/vitrina/productos-widget' title='Productos' fontIcon='bi-box-seam' hasBullet />
        <MenuItem to='/vitrina/servicios-Wdget' title='Servicios' fontIcon='bi-tools' hasBullet />
      </MenuInnerWithSub>
    </>
  )
}
