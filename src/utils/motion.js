export const prefersReducedMotion = () => document.documentElement.dataset.motion === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3)
