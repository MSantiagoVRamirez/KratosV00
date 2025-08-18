import {Route, Routes} from 'react-router-dom'
import {Registration} from './components/Registration'
import {Login} from './components/Login'
import {AuthLayout} from './AuthLayout'
import { ResetPassword } from './components/ResetPassword'

const AuthPage = () => (
  <Routes>
    <Route element={<AuthLayout />}>
    {/* Dentro de este componente debe hacer una linea con la etiqueta <Outlet /> */}
    {/* la cual define el lugar donde se renderiza el componente de la subruta actual */}
      <Route path='login' element={<Login />} />
      <Route path='registration' element={<Registration />} />
      <Route path='reset-password' element={<ResetPassword />} />
      <Route index element={<Login />} />
    </Route>
  </Routes>
)

export {AuthPage}
