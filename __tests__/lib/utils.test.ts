import { cn } from '@/lib/utils'

describe('Utils - cn function', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500')
    expect(result).toBe('text-red-500 bg-blue-500')
  })

  it('should handle conditional classes', () => {
    const result = cn('base-class', false && 'hidden', true && 'visible')
    expect(result).toBe('base-class visible')
  })

  it('should merge tailwind classes correctly', () => {
    const result = cn('px-2', 'px-4')
    expect(result).toBe('px-4')
  })
})
