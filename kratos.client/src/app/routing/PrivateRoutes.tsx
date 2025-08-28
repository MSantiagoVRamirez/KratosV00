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
import { StockProductosWidget } from '../pages/Inventario/StockProductosWidget'
import { StockServiciosWidget } from '../pages/Inventario/StockServiciosWidget'
// Contratos y ODs 
import { TroncalesWidget } from '../pages/contratos-ods/TroncalesWidget'
import { ProyectosWidget } from '../pages/contratos-ods/ProyectosWidget'
import { ContratosWidget } from '../pages/contratos-ods/ContratosWidget'
import { ContratoDetails } from '../pages/contratos-ods/ContratoDetails'
import { ActasContratoWidget } from '../pages/contratos-ods/ActasContratoWidget'
import { AmpliacionesContratoWidget } from '../pages/contratos-ods/AmpliacionesContratoWidget'
import { OrdenesServicioWidget } from '../pages/contratos-ods/OrdenesServicioWidget'
import { ODSDetails } from '../pages/contratos-ods/ODSDetails'
import { SubOrdenesServicioWidget } from '../pages/contratos-ods/SubOrdenesServicioWidget'
import { SubODSDetails } from '../pages/contratos-ods/SubODSDetails'
import { ActasODSWidget } from '../pages/contratos-ods/ActasODSWidget'
import { OrdenesCambioWidget } from '../pages/contratos-ods/OrdenesCambioWidget'
import { SuspensionesWidget } from '../pages/contratos-ods/SuspensionesWidget'
import { PlantasWidget } from '../pages/contratos-ods/PlantasWidget'
import { SistemasWidget } from '../pages/contratos-ods/SistemasWidget'
import { HitosPagoWidget } from '../pages/contratos-ods/HitosPagoWidget'

// Talleres y Hallazgos
import { TiposTallerWidget } from '../pages/talleres-hallazgos/TiposTallerWidget'
import { DisciplinasWidget } from '../pages/talleres-hallazgos/DisciplinasWidget'
import { TalleresWidget } from '../pages/talleres-hallazgos/TalleresWidget'
import { TallerDetails } from '../pages/talleres-hallazgos/TallerDetails'
import { HallazgosWidget } from '../pages/talleres-hallazgos/HallazgosWidget'
import { HallazgosDetails } from '../pages/talleres-hallazgos/HallazgoDetails'
import { AccionesCierreWidget } from '../pages/talleres-hallazgos/AccionesCierreWidget'

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
        <Route path="ventas/POS" element={<POSWidget />} />

        {/* Inventario */}
        <Route path="inventario/Stock-Productos-widget" element={<StockProductosWidget />} />
        <Route path="inventario/Agenda-Servicios-widget" element={<StockServiciosWidget />} />

        


        {/* Contratos y ODS */}
        <Route path="contratos-ods/proyectos-widget" element={<ProyectosWidget />} />
        <Route path="contratos-ods/contratos-widget" element={<ContratosWidget />} />
        <Route path="contratos-ods/contrato-details" element={<ContratoDetails propsContratoId={0} />} />
        <Route path="contratos-ods/actas-contrato-widget" element={<ActasContratoWidget selectedContratoId={0} />} />
        <Route path="contratos-ods/ampliaciones-contrato-widget" element={<AmpliacionesContratoWidget selectedContratoId={0} />} />
        <Route path="contratos-ods/troncales-widget" element={<TroncalesWidget />} />
        <Route path="contratos-ods/ordenes-servicio-widget" element={<OrdenesServicioWidget selectedContratoId={0} />} />
        <Route path="contratos-ods/ods-details" element={<ODSDetails propsODSId={0} />} />
        <Route path="contratos-ods/sub-ordenes-servicio-widget" element={<SubOrdenesServicioWidget selectedODSId={0} />} />
        <Route path="contratos-ods/sub-ods-details" element={<SubODSDetails propsODSId={0} />} />
        <Route path="contratos-ods/actas-ods-widget" element={<ActasODSWidget selectedODSId={0} />} />
        <Route path="contratos-ods/ordenes-cambio-widget" element={<OrdenesCambioWidget selectedODSId={0} />} />
        <Route path="contratos-ods/suspensiones-widget" element={<SuspensionesWidget selectedOdsId={0} />} />
        <Route path="contratos-ods/plantas-widget" element={<PlantasWidget />} />
        <Route path="contratos-ods/sistemas-widget" element={<SistemasWidget />} />
        <Route path="contratos-ods/hitos-pago-widget" element={<HitosPagoWidget selectedODSId={0} />} />

        {/* Talleres y Hallazgos */}
        <Route path="talleres-hallazgos/tipos-taller-widget" element={<TiposTallerWidget />} />
        <Route path="talleres-hallazgos/disciplinas-widget" element={<DisciplinasWidget />} />
        <Route path="talleres-hallazgos/talleres-widget" element={<TalleresWidget selectedODSId={0} />} />
        <Route path="talleres-hallazgos/taller-details" element={<TallerDetails propsTallerId={0} />} />
        <Route path="talleres-hallazgos/hallazgos-widget" element={<HallazgosWidget selectedTallerId={0} />} />
        <Route path="talleres-hallazgos/hallazgo-details" element={<HallazgosDetails propsHallazgoId={0} />} />
        <Route path="talleres-hallazgos/acciones-cierre-widget" element={<AccionesCierreWidget selectedHallazgoId={0} />} />
      </Route>
    </Routes>
  )
}

export { PrivateRoutes }
