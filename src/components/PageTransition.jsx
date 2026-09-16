import { motion } from 'framer-motion'

export default function PageTransition({ children }) {
  return <motion.div className="page-transition" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .38, ease: [.22, 1, .36, 1] }}>{children}</motion.div>
}
