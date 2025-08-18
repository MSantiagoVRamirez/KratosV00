import {useEffect, useRef, FC} from 'react'
import ApexCharts, {ApexOptions} from 'apexcharts'
import {getCSSVariableValue} from '../../../_metronic/assets/ts/_utils'
import {useThemeMode} from '../../../_metronic/partials/layout/theme-mode/ThemeModeProvider'

type Props = {
  title?: string
  data: number[]
  labels: string[]
  height?: number
  colors?: string[]
  className?: string
  showPercentages?: boolean
}

const DonutChart: FC<Props> = ({
  title = 'Donut Chart',
  data,
  labels,
  height = 350,
  colors,
  className = '',
  showPercentages = true
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const {mode} = useThemeMode()

  useEffect(() => {
    const chart = refreshChart()

    return () => {
      if (chart) {
        chart.destroy()
      }
    }
  }, [chartRef, mode, data, labels])

  const refreshChart = () => {
    if (!chartRef.current) {
      return
    }

    const chart = new ApexCharts(chartRef.current, getChartOptions())
    if (chart) {
      chart.render()
    }

    return chart
  }

  const getChartOptions = (): ApexOptions => {
    const labelColor = getCSSVariableValue('--bs-gray-500')
    const defaultColors = [
      getCSSVariableValue('--bs-primary'),
      getCSSVariableValue('--bs-success'),
      getCSSVariableValue('--bs-warning'),
      getCSSVariableValue('--bs-danger'),
      getCSSVariableValue('--bs-info'),
    ]

    return {
      series: data,
      chart: {
        fontFamily: 'inherit',
        type: 'donut',
        height: height,
      },
      labels: labels,
      colors: colors || defaultColors,
             legend: {
         show: true,
         position: 'right',
         labels: {
           colors: labelColor,
         },
       },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '16px',
                color: labelColor,
              },
              value: {
                show: true,
                fontSize: '20px',
                fontWeight: 'bold',
                color: labelColor,
                                 formatter: function (val) {
                   return String(val)
                 },
              },
              total: {
                show: true,
                label: 'Total',
                fontSize: '16px',
                color: labelColor,
                                 formatter: function (w) {
                   return w.globals.seriesTotals.reduce((a: number, b: number) => {
                     return a + b
                   }, 0).toString()
                 },
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: showPercentages,
        style: {
          fontSize: '12px',
          colors: ['#fff'],
        },
                 formatter: function (val) {
           return (typeof val === 'number' ? val.toFixed(1) : val) + '%'
         },
      },
      stroke: {
        show: false,
      },
      tooltip: {
        style: {
          fontSize: '12px',
        },
        y: {
          formatter: function (val) {
            return val.toString()
          },
        },
      },
    }
  }

  return (
    <div className={`card ${className}`}>
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1'>{title}</span>
        </h3>
      </div>
      <div className='card-body d-flex justify-content-center'>
        <div ref={chartRef} style={{height: `${height}px`}} />
      </div>
    </div>
  )
}

export default DonutChart