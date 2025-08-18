import {SidebarMenuItemWithSub} from './SidebarMenuItemWithSub'
import {SidebarMenuItem} from './SidebarMenuItem'

const SidebarMenuMain = () => {

  return (
    <>
      <SidebarMenuItem to='/dashboard' title='Home' icon='element-11' fontIcon='bi-app-indicator' />
  
        <SidebarMenuItemWithSub to='/seguridad' title='Seguridad' icon='shield' fontIcon='bi-shield'>
          <SidebarMenuItem to="seguridad/actividad-economica-widget" title="Actividad Economica" />
        </SidebarMenuItemWithSub>
    </>
  )
}

export {SidebarMenuMain}
