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
  showTotal?: boolean
  totalLabel?: string
}

const RadialBarChart: FC<Props> = ({
  title = 'Radial Bar Chart',
  data,
  labels,
  height = 350,
  colors,
  className = '',
  showTotal = true,
  totalLabel = 'Total'
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
      getCSSVariableValue('--bs-danger'),
      getCSSVariableValue('--bs-warning'),
      getCSSVariableValue('--bs-success'),
      getCSSVariableValue('--bs-primary'),
      getCSSVariableValue('--bs-info'),
    ]

    return {
      series: data,
      chart: {
        fontFamily: 'inherit',
        type: 'radialBar',
        height: height,
      },
      labels: labels,
      colors: colors || defaultColors,
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: '16px',
              color: labelColor,
            },
            value: {
              fontSize: '20px',
              fontWeight: 'bold',
              color: labelColor,
            },
            total: {
              show: showTotal,
              label: totalLabel,
              fontSize: '16px',
              color: labelColor,
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => {
                  return a + b
                }, 0)
                return Math.round(total / w.globals.series.length).toString()
              },
            },
          },
          hollow: {
            size: '50%',
          },
        },
      },
      legend: {
        show: true,
        position: 'bottom',
        labels: {
          colors: labelColor,
        },
      },
      tooltip: {
        style: {
          fontSize: '12px',
        },
        y: {
          formatter: function (val) {
            return val + '%'
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

export default RadialBarChart