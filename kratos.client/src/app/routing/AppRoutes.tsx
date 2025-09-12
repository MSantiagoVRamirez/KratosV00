import { FC } from 'react'
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'
import { PrivateRoutes } from './PrivateRoutes'
import { ErrorsPage } from '../modules/errors/ErrorsPage'
import { useAuth } from '../modules/auth/AuthContext'
import { App } from '../App'
import Landing from '../modules/auth/components/Landing'

const { BASE_URL } = import.meta.env

const AppRoutes: FC = () => {
  const { isAuth, hydrated } = useAuth();

  // Evitar redirecciones equivocadas hasta hidratar el estado de sesión
  if (!hydrated) {
    return (
      <div style={{minHeight: '100vh'}} className='d-flex align-items-center justify-content-center'>
        <div className='text-center'>
          <div className='spinner-border text-primary mb-4' role='status'>
            <span className='visually-hidden'>Cargando...</span>
          </div>
          <div className='fw-semibold'>Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter basename={BASE_URL}>
      <Routes>
        <Route element={<App />}>
          <Route path='error/*' element={<ErrorsPage />} />
          {isAuth ? (
            <>
              <Route path='/*' element={<PrivateRoutes />} />
              <Route index element={<Navigate to='/home' />} />
            </>
          ) : (
            <>
              <Route path='landing/*' element={<Landing />} />
              <Route path='*' element={<Navigate to='/landing' />} />
            </>
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export { AppRoutes }
