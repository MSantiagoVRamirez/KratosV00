import { useState, useEffect } from "react"
import { ActividadEconomica } from "../../interfaces/Configuracion/ActividadEconomica"
import ActividadEconomicaService from "../../services/Configuracion/ActividadEconomicaService"
import '../../Styles/estilos.css'
import { ModalDialog } from "../components/ModalDialog"
import { grid2ColStyle } from "../../utils"
import { useFormValidation } from '../../hooks/useFormValidation'
import { GridColDef, GridRenderCellParams, DataGrid } from '@mui/x-data-grid';
import { IconButton, Box } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

export function ActividadEconomicaWitdget() {

  const defaultActividadEconomica: ActividadEconomica = {
    id: 0,
    codigoCiiu: '',
    nombre: '',
    descripcion: '',
    categoria: '',
  }
    const [actividades, setActividades] = useState<ActividadEconomica[]>([])
    const [editedActividades, setEditedActividades] = useState<ActividadEconomica>(defaultActividadEconomica)
    const [deleteActividadId, setDeleteActividadId] = useState<number>(defaultActividadEconomica.id)
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  
    // Modal de Creación/Edición/Eliminación
    const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)
    const [showContent, setShowContent] = useState(true)

    // Cerrar el Modal de Creación/Edición/Eliminación
    const closeModal = () => setModalType(null)
  
    // Validación del formulario
    const isFormValid = useFormValidation({
      codigoCiiu: { value: editedActividades.codigoCiiu, required: true, type: 'string' },
      nombre: { value: editedActividades.nombre, required: true, type: 'string' },
      descripcion: { value: editedActividades.descripcion, required: true, type: 'string' },
      categoria: { value: editedActividades.categoria, required: true, type: 'string' },
    });
  
    // Obtener todos los roles
    const fetchListaActividades = () => {
      ActividadEconomicaService.getAll()
        .then((response) => {
          typeof (response.data) === 'string' ? setShowContent(false) : setActividades(response.data)  
        })
        .catch((error) => {
          console.error("Error al obtener la lista de Actividades Economicas", error)
        })
    }
  
    // Obtener todos los roles cada vez que se renderiza el componente
    useEffect(() => {
      fetchListaActividades()
    }, [])
  
    // Obtener un solo rol (para editar)
    const fetchActividad = (id: number) => {
      ActividadEconomicaService.get(id)
        .then((response) => {
          setEditedActividades(response.data)  // Llenar el estado unificado
          setModalType('edit')  // Mostrar el formulario de edición
        })
        .catch((error) => {
          console.error("Hubo un error al obtener el rol", error)
        })
    }
  
    // Crear un rol
    const createActividad = (data: ActividadEconomica) => {
      ActividadEconomicaService.create(data)
        .then(() => {
          setEditedActividades(defaultActividadEconomica); // Resetear estado unificado
          closeModal()  // Ocultar el formulario
          fetchListaActividades()  // Actualizar la lista de roles
        })
        .catch((error) => {
          console.error("Hubo un error al crear el rol", error)
          alert(`Error al crear rol: ${error.response?.data || error.response?.data?.message || error.message}`);
        })
    }
  
    // Actualizar un rol
    const updateActividad = (data: ActividadEconomica) => {
      ActividadEconomicaService.update(data)
        .then(() => {
          setEditedActividades(defaultActividadEconomica); // Resetear estado unificado
          (defaultActividadEconomica) // Resetear estado unificado
          closeModal()  // Ocultar el formulario
          fetchListaActividades()  // Actualizar la lista de roles
        })
        .catch((error) => {
          console.error("Hubo un error al actualizar el rol", error)
          alert(`Error al actualizar rol: ${error.response?.data || error.response?.data?.message || error.message}`);
        })
    }
  
    // Eliminar un rol
    const deleteActividad = () => {
      ActividadEconomicaService.remove(deleteActividadId)
        .then(() => {
          setDeleteActividadId(defaultActividadEconomica.id) // Limpiar el input de eliminación
          closeModal()  // Ocultar el popup de Confirmación
          fetchListaActividades()  // Actualizar la lista de roles
        })
        .catch((error) => {
          console.error("Hubo un error al eliminar el rol", error)
          alert(`Error al eliminar rol: ${error.response?.data || error.response?.data?.message || error.message}`);
        })
    }
  
    // Mostrar el cuadro de diálogo de confirmar eliminación
    const openDeleteModal = (id: number) => {
      setDeleteActividadId(id)
      setModalType('delete')
    }
    const columnas: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'codigoCiiu', headerName: 'Código CIIU', flex: 1 },
  { field: 'nombre', headerName: 'Nombre', flex: 1 },
  { field: 'descripcion', headerName: 'Descripción', flex: 2 },
  { field: 'categoria', headerName: 'Categoría', flex: 1 },
  {
    field: 'acciones',
    headerName: 'Acciones',
    width: 150,
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <Box>
        <IconButton onClick={() => fetchActividad(params.row.id)}>
          <Edit className="icon-editar" />
        </IconButton>
        <IconButton onClick={() => openDeleteModal(params.row.id)}>
          <Delete className="icon-eliminar" />
        </IconButton>
      </Box>
    ),
  },
];
return (
  <div className="contenido">
    <div  id="actividad" className="bloque-formulario">
      <div > <h2 >Listado de Actividades Económicas</h2></div>
      <div className="bloque-botones">
        <button
            style={{ marginTop: '0px' }}
            className="boton-formulario"
            onClick={() => {
              setEditedActividades(defaultActividadEconomica);
              setModalType('create');
            }}>
            Agregar Nueva Actividad
          </button>
            <div style={{ height: '70%', width: '96%', margin: '1rem' }}>
              <DataGrid
                  rows={actividades}
                  columns={columnas}
                  disableRowSelectionOnClick
                  getRowId={(row) => row.id}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  pageSizeOptions={[5, 10, 15]}
                  sx={{
                      background: 'linear-gradient(45deg, rgba(10, 70, 120, 0.7), rgba(21, 154, 230, 0.7))',
                      borderRadius: '10px',
                      color: '#fff',
                      '& .MuiDataGrid-columnHeaders': {
                          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                      },
                      '& .MuiDataGrid-columnHeader': {
                          backgroundColor: 'rgb(20, 111, 165)',
                          color: '#fff',
                          fontWeight: 'bold',
                      },
                      '& .MuiDataGrid-cell': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: '#fff',
                          fontSize: '0.95rem',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                      },
                      '& .MuiDataGrid-row:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '& .MuiDataGrid-footerContainer': {
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          color: '#fff',
                          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                      },
                      '& .MuiSvgIcon-root': {
                          color: '#fff',
                      },
                      '& .MuiTablePagination-root': {
                          color: '#fff',
                      },
                  }}
              />
          </div>
      </div>
      {/* Formulario Unificado de Usuario */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Actividad Economica" : "Editar Actividad Economica"}
            isFormValid={isFormValid}
            content={
              <div style={grid2ColStyle}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{color:'white'}} className="form-label required">Código Ciiu</label>
                  <input
                    type="text"
                    placeholder="Código CIIU"
                    value={editedActividades.codigoCiiu || ''}
                    onChange={(e) =>
                      setEditedActividades(prev => ({
                        ...prev,
                        codigoCiiu: e.target.value  // ¡Actualiza la propiedad correcta!
                      }))
                    }
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{color:'white'}} className="form-label required">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre de la actividad"
                    value={editedActividades.nombre || ''}
                    onChange={(e) =>
                      setEditedActividades(prev => ({
                        ...prev,
                        nombre: e.target.value      // usa 'nombre', no 'nombres'
                      }))
                    }
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{color:'white'}} className="form-label required">Descripción</label>
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={editedActividades.descripcion || ''}
                    onChange={(e) =>
                      setEditedActividades(prev => ({
                        ...prev,
                        descripcion: e.target.value // usa 'descripcion', no 'apellidos'
                      }))
                    }
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{color:'white'}} className="form-label required">Categoría</label>
                  <input
                    type="text"
                    placeholder="Categoría"
                    value={editedActividades.categoria || ''}
                    onChange={(e) =>
                      setEditedActividades(prev => ({
                        ...prev,
                        categoria: e.target.value   // usa 'categoria', no 'correo'
                      }))
                    }
                    className="form-control"
                    required
                  />
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => { // Llamar a la función correcta con el estado unificado
              if (modalType === 'create') {
                createActividad(editedActividades);
              } else {
                updateActividad(editedActividades);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Caja de Confirmación de Eliminación de Usuario */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación" // Título actualizado
            // Mensaje actualizado
            content={`¿Está seguro que desea eliminar el usuario ${actividades.find(u => u.id === deleteActividadId)?.nombre}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger" // Usar prop para botón rojo
            onConfirm={deleteActividad}
            closeModal={closeModal}
          />
        )}
    </div>
  </div>
 )
}