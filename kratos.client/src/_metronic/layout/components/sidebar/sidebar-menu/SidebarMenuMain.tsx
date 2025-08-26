import {SidebarMenuItemWithSub} from './SidebarMenuItemWithSub'
import {SidebarMenuItem} from './SidebarMenuItem'

const SidebarMenuMain = () => {

  return (
    <>
      <SidebarMenuItem to='/dashboard' title='Home' icon='element-11' fontIcon='bi-app-indicator' />
      {/*Configuracion*/}
        <SidebarMenuItemWithSub to='/seguridad' title='Configuración' icon='shield' fontIcon='bi-shield'>
          <SidebarMenuItem to="seguridad/empresa-widget" title="Perfil" /> 
          <SidebarMenuItem to="seguridad/roles-widget" title="Roles " />
          <SidebarMenuItem to="seguridad/permisos-widget" title="Permisos " />
          <SidebarMenuItem to="seguridad/usuarios-widget" title="Usuarios " />
          <SidebarMenuItem to="seguridad/sucursal-widget" title="Sucursales " /> {/* esta vista sera una vista de lista de tarjetas*/}
        </SidebarMenuItemWithSub>
        {/*Inventario*/}
        <SidebarMenuItemWithSub to='/inventario' title='Inventario' icon='shield' fontIcon='bi-shield'>
          <SidebarMenuItem to="ventas/registro-producto-widget" title="Regitro Productos " />
          <SidebarMenuItem to="inventario/registro-Servicios-widget" title="Registro Servicios " />
          <SidebarMenuItem to="inventario/Stock-Productos-widget" title="Stock Productos" />
          <SidebarMenuItem to="inventario/Agenda-Servicios-widget" title="Stock Servicios" />        
        </SidebarMenuItemWithSub> 
        {/*Ventas*/}
        <SidebarMenuItemWithSub to='/ventas' title='Ventas' icon='shield' fontIcon='bi-shield'>
          <SidebarMenuItem to="ventas/ventas-widget" title="Ventas " />
          <SidebarMenuItem to="ventas/POS" title="POS" />
        </SidebarMenuItemWithSub>
        {/*Compras*/}
        <SidebarMenuItemWithSub to='/compras' title='Compras' icon='shield' fontIcon='bi-shield'>
          <SidebarMenuItem to="compras/compras-widget" title="Compras " />
          <SidebarMenuItem to="compras/ordenes-compra" title="Ordenes de Compra " />
          <SidebarMenuItem to="compras/Proveedores-Widget" title="Proveedores" />
          <SidebarMenuItem to="compras/entrada-productos-Widget" title="Resepcion de Productos" />
        </SidebarMenuItemWithSub>
        {/*Catalogo*/}
        <SidebarMenuItemWithSub to='/Catalogo' title='Catalogo' icon='shield' fontIcon='bi-shield'>
          <SidebarMenuItem to="vitrina/ofertas-widget" title="Ofertas " />
          <SidebarMenuItem to="vitrina/productos-widget" title="Productos" />
          <SidebarMenuItem to="vitrina/servicios-Wdget" title="Servicios " />
        </SidebarMenuItemWithSub>
    </>
  )
}

export {SidebarMenuMain}
