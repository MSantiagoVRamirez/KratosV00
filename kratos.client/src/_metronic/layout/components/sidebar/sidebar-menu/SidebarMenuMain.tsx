import {SidebarMenuItemWithSub} from './SidebarMenuItemWithSub'
import {SidebarMenuItem} from './SidebarMenuItem'

const SidebarMenuMain = () => {

  return (
    <>
      <SidebarMenuItem to='/dashboard' title='Home' icon='element-11' fontIcon='bi-app-indicator' />

      {/* Configuración */}
      <SidebarMenuItemWithSub to='/seguridad' title='Configuración' icon='setting-2' fontIcon='bi-gear'>
        <SidebarMenuItem to='seguridad/empresa-widget' title='Perfil' icon='profile-circle' fontIcon='bi-building' />
        <SidebarMenuItem to='seguridad/roles-widget' title='Roles ' icon='badge' fontIcon='bi-person-badge' />
        <SidebarMenuItem to='seguridad/permisos-widget' title='Permisos ' icon='key' fontIcon='bi-key' />
        <SidebarMenuItem to='seguridad/usuarios-widget' title='Usuarios ' icon='people' fontIcon='bi-people' />
        <SidebarMenuItem to='ventas/punto-venta-widget' title='Sucursales ' icon='shop' fontIcon='bi-shop' />
      </SidebarMenuItemWithSub>

      {/* Inventario */}
      <SidebarMenuItemWithSub to='/inventario' title='Inventario' icon='cube-3' fontIcon='bi-box'>
        <SidebarMenuItem to='ventas/registro-producto-widget' title='Regitro Productos ' icon='cube-3' fontIcon='bi-box' />
        <SidebarMenuItem to='ventas/registro-servicio-widget' title='Registro Servicios ' icon='verify' fontIcon='bi-tools' />
        <SidebarMenuItem to='inventario/Stock-Productos-widget' title='Stock Productos' icon='clipboard' fontIcon='bi-clipboard-data' />
        <SidebarMenuItem to='inventario/Agenda-Servicios-widget' title='Stock Servicios' icon='clipboard' fontIcon='bi-clipboard-check' />
      </SidebarMenuItemWithSub>

      {/* Ventas */}
      <SidebarMenuItemWithSub to='/ventas' title='Ventas' icon='element-11' fontIcon='bi-cart'>
        <SidebarMenuItem to='ventas/ventas-widget' title='Ventas ' icon='element-11' fontIcon='bi-receipt' />
        <SidebarMenuItem to='ventas/POS' title='POS' icon='element-11' fontIcon='bi-cash' />
      </SidebarMenuItemWithSub>

      {/* Compras */}
      <SidebarMenuItemWithSub to='/compras' title='Compras' icon='element-11' fontIcon='bi-bag'>
        <SidebarMenuItem to='compras/compras-widget' title='Compras ' icon='element-11' fontIcon='bi-bag-check' />
        <SidebarMenuItem to='compras/ordenes-compra' title='Ordenes de Compra ' icon='clipboard' fontIcon='bi-clipboard-check' />
        <SidebarMenuItem to='compras/Proveedores-Widget' title='Proveedores' icon='truck' fontIcon='bi-truck' />
        <SidebarMenuItem to='compras/entrada-productos-Widget' title='Resepcion de Productos' icon='element-11' fontIcon='bi-box-arrow-in-down' />
      </SidebarMenuItemWithSub>

      {/* Catalogo */}
      <SidebarMenuItemWithSub to='/Catalogo' title='Catalogo' icon='grid-2' fontIcon='bi-grid'>
        <SidebarMenuItem to='vitrina/ofertas-widget' title='Ofertas ' icon='discount' fontIcon='bi-tags' />
        <SidebarMenuItem to='vitrina/productos-widget' title='Productos' icon='element-11' fontIcon='bi-box-seam' />
        <SidebarMenuItem to='vitrina/servicios-Wdget' title='Servicios ' icon='verify' fontIcon='bi-tools' />
      </SidebarMenuItemWithSub>
    </>
  )
}

export {SidebarMenuMain}
