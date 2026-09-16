import RingButton from './GlowRing'
export default function Button({ children, variant = 'primary', className = '', ...props }) {
  return <RingButton className={`vx-button-${variant} ${className}`} {...props}>{children}</RingButton>
}
