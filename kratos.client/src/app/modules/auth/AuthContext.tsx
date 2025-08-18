import { createContext, useContext, useState, ReactNode } from "react";

// Definimos la interfaz para nuestro contexto
interface AuthContextType {
  isAuth: boolean;
  user: string | null;
  role: string | null;
  invertAuth: () => void;
  saveUser: (user: string) => void;
  saveRole: (role: string) => void;
}

// Creamos el contexto con valores iniciales
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider para envolver la aplicación
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Función que invierte el estado de autenticación
  const invertAuth = () => {
    setIsAuth((prev) => !prev);
  };

  // Función para guardar el usuario autenticado
  const saveUser = (user: string) => {
    setUser(user);
  };

  // Función para guardar el rol del usuario autenticado
  const saveRole = (role: string) => {
    setRole(role);
  };

  return (
    <AuthContext.Provider value={{ isAuth, user, role, invertAuth, saveUser, saveRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};