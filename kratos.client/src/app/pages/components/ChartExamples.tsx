import { FC } from 'react'
import { Content } from '../../../_metronic/layout/components/content'
import AreaChart from './AreaChart'
import AreaChartHorizontal from './AreaChartHorizontal'
import ColumnChart from './ColumnChart'
import DonutChart from './DonutChart'
import LineChart from './LineChart'
import PieChart from './PieChart'
import RadialBarChart from './RadialBarChart'

/**
 * Ejemplos de uso de los componentes de gráficos implementados
 * 
 * Cada componente es completamente reutilizable y acepta datos como props.
 * Puedes copiar cualquiera de estos ejemplos y modificar los datos según necesites.
 */
const ChartExamples: FC = () => {
  return (
    <Content>
      <div className="mb-10">
        <h1 className="mb-5">Ejemplos de Componentes de Gráficos</h1>
        <p className="text-muted">
          Aquí tienes ejemplos de cómo usar cada uno de los componentes de gráficos implementados.
          Todos los componentes utilizan ApexCharts y son completamente personalizables.
        </p>
      </div>

      {/* Line Chart */}
      <div className="mb-10">
        <h2 className="mb-5">1. Line Chart</h2>
        <div className="row">
          <div className="col-xl-8">
            <LineChart 
              title="Ventas Mensuales 2024"
              data={[120, 132, 101, 134, 90, 230, 210, 180, 195, 210, 185, 200]}
              categories={['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']}
              seriesName="Ventas ($K)"
              color="#3F4254"
            />
          </div>
          <div className="col-xl-4">
            <div className="card h-100">
              <div className="card-body">
                <h5>Uso del LineChart:</h5>
                <pre><code>{`<LineChart 
  title="Ventas Mensuales 2024"
  data={[120, 132, 101, 134...]}
  categories={['Ene', 'Feb'...]}
  seriesName="Ventas ($K)"
  color="#3F4254"
/>`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <div className="mb-10">
        <h2 className="mb-5">2. Area Chart</h2>
        <div className="row">
          <div className="col-xl-8">
            <AreaChart 
              title="Comparación de Equipos de Ventas"
              series={[
                { name: 'Equipo Norte', data: [31, 40, 28, 51, 42, 109, 100] },
                { name: 'Equipo Sur', data: [11, 32, 45, 32, 34, 52, 41] },
                { name: 'Equipo Centro', data: [15, 20, 30, 25, 28, 35, 30] }
              ]}
              categories={['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']}
              colors={['#009EF7', '#50CD89', '#F1416C']}
            />
          </div>
          <div className="col-xl-4">
            <div className="card h-100">
              <div className="card-body">
                <h5>Uso del AreaChart:</h5>
                <pre><code>{`<AreaChart 
  title="Comparación de Equipos"
  series={[
    { name: 'Equipo Norte', data: [...] },
    { name: 'Equipo Sur', data: [...] }
  ]}
  categories={['Lun', 'Mar'...]}
  colors={['#009EF7', '#50CD89']}
/>`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Column Chart */}
      <div className="mb-10">
        <h2 className="mb-5">3. Column Chart</h2>
        <div className="row">
          <div className="col-xl-8">
            <ColumnChart 
              title="Ingresos Trimestrales por Región"
              series={[
                { name: 'Norte', data: [44, 55, 41, 37] },
                { name: 'Sur', data: [53, 32, 33, 52] },
                { name: 'Este', data: [12, 17, 11, 9] },
                { name: 'Oeste', data: [9, 7, 5, 8] }
              ]}
              categories={['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024']}
              horizontal={false}
            />
          </div>
          <div className="col-xl-4">
            <div className="card h-100">
              <div className="card-body">
                <h5>Uso del ColumnChart:</h5>
                <pre><code>{`<ColumnChart 
  title="Ingresos Trimestrales"
  series={[
    { name: 'Norte', data: [44, 55...] },
    { name: 'Sur', data: [53, 32...] }
  ]}
  categories={['Q1', 'Q2'...]}
  horizontal={false}
/>`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie Chart y Donut Chart */}
      <div className="mb-10">
        <h2 className="mb-5">4. Pie Chart y Donut Chart</h2>
        <div className="row">
          <div className="col-xl-6">
            <PieChart 
              title="Distribución de Clientes por Tipo"
              data={[35, 25, 20, 15, 5]}
              labels={['Enterprise', 'SMB', 'Startup', 'Freelancer', 'Otros']}
              showPercentages={true}
            />
          </div>
          <div className="col-xl-6">
            <DonutChart 
              title="Estado de Proyectos"
              data={[60, 30, 10]}
              labels={['Completados', 'En Progreso', 'Pendientes']}
              colors={['#50CD89', '#FFC700', '#F1416C']}
            />
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5>Uso de PieChart y DonutChart:</h5>
                <pre><code>{`<PieChart 
  title="Distribución de Clientes"
  data={[35, 25, 20, 15, 5]}
  labels={['Enterprise', 'SMB'...]}
  showPercentages={true}
/>

<DonutChart 
  title="Estado de Proyectos"
  data={[60, 30, 10]}
  labels={['Completados', 'En Progreso'...]}
  colors={['#50CD89', '#FFC700'...]}
/>`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Radial Bar Chart */}
      <div className="mb-10">
        <h2 className="mb-5">5. Radial Bar Chart</h2>
        <div className="row">
          <div className="col-xl-6">
            <RadialBarChart 
              title="KPIs del Equipo"
              data={[85, 70, 92, 78]}
              labels={['Ventas', 'Marketing', 'Soporte', 'Desarrollo']}
              showTotal={true}
              totalLabel="Promedio General"
            />
          </div>
          <div className="col-xl-6">
            <div className="card h-100">
              <div className="card-body">
                <h5>Uso del RadialBarChart:</h5>
                <pre><code>{`<RadialBarChart 
  title="KPIs del Equipo"
  data={[85, 70, 92, 78]}
  labels={['Ventas', 'Marketing'...]}
  showTotal={true}
  totalLabel="Promedio General"
/>`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Area Chart Horizontal */}
      <div className="mb-10">
        <h2 className="mb-5">6. Area Chart Horizontal (Temporal)</h2>
        <div className="row">
          <div className="col-12">
            <AreaChartHorizontal 
              title="Actividad de Usuarios por Horas"
              series={[
                { 
                  name: 'Usuarios Activos', 
                  data: [5, 3, 2, 1, 1, 2, 8, 15, 25, 35, 40, 45, 50, 48, 45, 40, 35, 30, 25, 20, 15, 12, 8, 6] 
                },
                { 
                  name: 'Nuevos Registros', 
                  data: [1, 0, 0, 0, 0, 0, 2, 5, 8, 12, 15, 18, 20, 18, 15, 12, 10, 8, 6, 4, 3, 2, 1, 1] 
                }
              ]}
              timeCategories={[
                '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', 
                '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
                '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
                '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
              ]}
            />
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5>Uso del AreaChartHorizontal:</h5>
                <pre><code>{`<AreaChartHorizontal 
  title="Actividad por Horas"
  series={[
    { name: 'Usuarios Activos', data: [...] },
    { name: 'Nuevos Registros', data: [...] }
  ]}
  timeCategories={['00:00', '01:00'...]}
/>`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Propiedades disponibles */}
      <div className="mb-10">
        <h2 className="mb-5">Propiedades Disponibles</h2>
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h5>Propiedades Comunes:</h5>
                <ul>
                  <li><code>title?: string</code> - Título del gráfico</li>
                  <li><code>height?: number</code> - Altura en píxeles (default: 350)</li>
                  <li><code>className?: string</code> - Clases CSS adicionales</li>
                  <li><code>colors?: string[]</code> - Array de colores personalizados</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h5>Propiedades Específicas:</h5>
                <ul>
                  <li><strong>LineChart:</strong> <code>data</code>, <code>categories</code>, <code>seriesName</code>, <code>color</code></li>
                  <li><strong>AreaChart/ColumnChart:</strong> <code>series</code>, <code>categories</code></li>
                  <li><strong>PieChart/DonutChart:</strong> <code>data</code>, <code>labels</code>, <code>showPercentages</code></li>
                  <li><strong>RadialBarChart:</strong> <code>data</code>, <code>labels</code>, <code>showTotal</code>, <code>totalLabel</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Content>
  )
}

export default ChartExamples 