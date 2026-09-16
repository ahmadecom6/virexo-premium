import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'

export default function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const open = openIndex === index
        return (
          <div className={`faq-item vx-ring-surface${open ? ' is-open' : ''}`} key={item.id || item.question}>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`faq-answer-${item.id || index}`}
                onClick={() => setOpenIndex(open ? -1 : index)}
              >
                <span>{item.question}</span>
                <FiChevronDown />
              </button>
            </h3>
            <div id={`faq-answer-${item.id || index}`} className="faq-answer" role="region" hidden={!open}>
              <p>{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
