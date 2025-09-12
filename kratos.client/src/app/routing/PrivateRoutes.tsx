import { Route, Routes, Navigate } from 'react-router-dom'
import { MasterLayout } from '../../_metronic/layout/MasterLayout'

// Dashboard
import {DashboardWrapper} from '../pages/dashboard/DashboardWrapper'

// Seguridad
import { ModuloWidget } from '../pages/Configuracion/ModuloWidget'
import { PermisoWidget } from '../pages/Configuracion/PermisosWidget'
import { EmpresaWidget } from '../pages/Configuracion/EmpresaWidget'
import { UsuarioWidget } from '../pages/Configuracion/UsuarioWidget'
import { ActividadEconomicaWitdget } from '../pages/Configuracion/ActividadEconomicaWitdget'
import { RegimenTributarioWidget } from '../pages/Configuracion/RegimenTributariaWidget'
import { TipoSociedadWidget } from '../pages/Configuracion/TipoSociedadWidget'
import { RolWidget } from '../pages/Configuracion/RolWidget'

//Ventas
import { ProductoCreateWidget } from '../pages/Ventas/RegistroProductoWidget'
import { ServicioCreateWidget } from '../pages/Ventas/RegistroServicioWidget'
import { PuntoVentaWidget } from '../pages/Ventas/PuntoVentaWidget'
import { POSWidget } from '../pages/Ventas/POSWidget'
import { VentasWidget } from '../pages/Ventas/VentasWidget'
import { StockProductosWidget } from '../pages/Inventario/StockProductosWidget'
import { StockServiciosWidget } from '../pages/Inventario/StockServiciosWidget'
import { ProveedoresWidget } from '../pages/Ventas/ProveedoresWidget'
import { OrdenCompraWidget } from '../pages/Ventas/OrdenCompraWidget'
import { ComprasWidget } from '../pages/Ventas/ComprasWidget'
import { RecepcionProductosWidget } from '../pages/Ventas/RecepcionProductosWidget'

// Catálogo / Vitrina
import { OfertasWidget } from '../pages/Vitrina/OfertasWidget'
import { CatalogoProductosWidget } from '../pages/Vitrina/CatalogoProductosWidget'
import { CatalogoServiciosWidget } from '../pages/Vitrina/CatalogoServiciosWidget'
import { VitrinaEmpresa } from '../pages/Vitrina/VitrinaEmpresa'
import { UsuariosHome } from '../pages/usuarios/UsuariosHome'

const PrivateRoutes = () => {
  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Redirect to Dashboard after success login/registartion */}
        <Route path='auth/*' element={<Navigate to='/dashboard' />} />
        {/* Pages */}
        <Route path='dashboard' element={<DashboardWrapper />} />
        <Route path='*' element={<Navigate to='/error/404' />} />

        {/* Seguridad */}
        <Route path="seguridad/roles-widget" element={<RolWidget />} />
        <Route path="seguridad/modulo-widget" element={<ModuloWidget />} />
        <Route path="seguridad/permisos-widget" element={<PermisoWidget />} />
        <Route path="seguridad/empresa-widget" element={<EmpresaWidget />} />
        <Route path="seguridad/usuarios-widget" element={<UsuarioWidget />} />
        <Route path="seguridad/actividad-economica-widget" element={<ActividadEconomicaWitdget />} />
        <Route path="seguridad/regimen-tributario-widget" element={<RegimenTributarioWidget />} />
        <Route path="ventas/seguridad-tipo-sociedad-widget" element={<TipoSociedadWidget />} />

        {/* Ventas */}
        <Route path="ventas/registro-producto-widget" element={<ProductoCreateWidget />} />
        <Route path="ventas/registro-servicio-widget" element={<ServicioCreateWidget />} />
        <Route path="ventas/punto-venta-widget" element={<PuntoVentaWidget />} />
        <Route path="ventas/proveedores-widget" element={<ProveedoresWidget />} />
        <Route path="ventas/orden-compra-Widget" element={<OrdenCompraWidget />} />
        <Route path="ventas/compras-widget" element={<ComprasWidget />} />
        <Route path="ventas/recepcion-productos-widget" element={<RecepcionProductosWidget />} />
        <Route path="compras/compras-widget" element={<ComprasWidget />} />
        <Route path="ventas/ventas-widget" element={<VentasWidget />} />
        <Route path="ventas/POS" element={<POSWidget />} />

        {/* Inventario */}
        <Route path="inventario/Stock-Productos-widget" element={<StockProductosWidget />} />
        <Route path="inventario/Agenda-Servicios-widget" element={<StockServiciosWidget />} />


        {/* Catálogo / Vitrina */}
        <Route path="vitrina/ofertas-widget" element={<OfertasWidget />} />
        <Route path="vitrina/productos-widget" element={<CatalogoProductosWidget />} />
        <Route path="vitrina/servicios-Wdget" element={<CatalogoServiciosWidget />} />
        <Route path="vitrina/empresa/:empresaId" element={<VitrinaEmpresa />} />
        {/* Usuarios */}
        <Route path="usuarios/home" element={<UsuariosHome />} />
      </Route>
    </Routes>
  )
}

export { PrivateRoutes }
