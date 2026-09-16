// Minimal single-page PDF writer (no external library) for the estimate download.
function escapePdfText(value) {
  return String(value).replace(/[^\x20-\x7E]/g, '').replace(/[\\()]/g, (match) => `\\${match}`)
}

function buildPdf(title, lines) {
  let content = `BT /F2 20 Tf 56 780 Td (${escapePdfText(title)}) Tj ET\n`
  let y = 742
  lines.forEach((line) => {
    content += `BT /F1 11 Tf 56 ${y} Td (${escapePdfText(line)}) Tj ET\n`
    y -= 22
  })

  const objects = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R/F2 6 0 R>>>>>>',
    `<</Length ${content.length}>>stream\n${content}endstream`,
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold>>',
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = []
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  pdf += `trailer<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`
  return pdf
}

function triggerDownload(filename, content, type) {
  const blob = new Blob([content], { type })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(link.href), 800)
}

export function downloadPdf(filename, title, lines) {
  triggerDownload(filename, buildPdf(title, lines), 'application/pdf')
}

export function downloadCsv(filename, rows) {
  triggerDownload(filename, rows.join('\n'), 'text/csv')
}
