import React, { useEffect, useMemo, useState } from 'react'

type CarouselProps = {
  images: string[]
  intervalMs?: number
  height?: number | string
  showIndicators?: boolean
  showArrows?: boolean
}

export const Carousel: React.FC<CarouselProps> = ({
  images,
  intervalMs = 4000,
  height = 320,
  showIndicators = true,
  showArrows = true,
}) => {
  const safeImages = useMemo(() => images.filter(Boolean), [images])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (safeImages.length <= 1) return
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % safeImages.length)
    }, intervalMs)
    return () => clearInterval(t)
  }, [intervalMs, safeImages.length])

  const prev = () => setIdx((i) => (i - 1 + safeImages.length) % safeImages.length)
  const next = () => setIdx((i) => (i + 1) % safeImages.length)

  if (safeImages.length === 0) return null

  return (
    <div className='kc-carousel' style={{ height }}>
      <div className='kc-carousel-track' style={{ transform: `translateX(-${idx * 100}%)` }}>
        {safeImages.map((src, i) => (
          <div key={i} className='kc-carousel-slide'>
            <img src={src} alt={`slide-${i}`} />
          </div>
        ))}
      </div>
      {showArrows && safeImages.length > 1 && (
        <>
          <button className='kc-carousel-arrow left' onClick={prev} aria-label='Anterior'>‹</button>
          <button className='kc-carousel-arrow right' onClick={next} aria-label='Siguiente'>›</button>
        </>
      )}
      {showIndicators && safeImages.length > 1 && (
        <div className='kc-carousel-dots'>
          {safeImages.map((_, i) => (
            <button key={i} className={`dot ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)} aria-label={`Ir a slide ${i+1}`} />
          ))}
        </div>
      )}
    </div>
  )
}

