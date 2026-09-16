// Bulk CSV candidate import — pure parsing + validation. No external CSV library; a
// small quoted-field-aware line parser handles the expected column set:
// name, email, department, joinDate, supervisor (status always defaults to "Active").

const REQUIRED_COLUMNS = ['name', 'email']
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function splitCsvLine(line) {
  const cells = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') { current += '"'; i += 1 }
      else if (char === '"') inQuotes = false
      else current += char
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      cells.push(current)
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current)
  return cells.map((cell) => cell.trim())
}

/** Parses raw CSV text into { headers, rows }. Throws a descriptive Error on malformed input. */
export function parseCsv(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter((line) => line.trim().length > 0)
  if (!lines.length) throw new Error('The CSV file is empty.')

  const headerCells = splitCsvLine(lines[0]).map((cell) => cell.toLowerCase())
  if (headerCells.length === 1 && /[;\t]/.test(lines[0])) {
    throw new Error('Could not detect comma-separated columns. Please use commas to separate columns.')
  }
  const missingRequired = REQUIRED_COLUMNS.filter((column) => !headerCells.includes(column))
  if (missingRequired.length) {
    throw new Error(`CSV is missing required column(s): ${missingRequired.join(', ')}.`)
  }
  if (lines.length < 2) throw new Error('The CSV has a header row but no data rows.')

  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line)
    const row = {}
    headerCells.forEach((column, index) => { row[column] = (cells[index] ?? '').trim() })
    return row
  })

  return { headers: headerCells, rows }
}

/**
 * Annotates each parsed row with validation results, checking required fields, email
 * format, and duplicate emails against both existing candidates and other CSV rows.
 */
export function validateRows(rows, existingCandidates) {
  const existingEmails = new Set(existingCandidates.map((candidate) => candidate.email.toLowerCase()))
  const seenInFile = new Set()

  return rows.map((row, index) => {
    const email = (row.email || '').toLowerCase()
    const errors = []
    if (!row.name?.trim()) errors.push('Missing name.')
    if (!row.email?.trim()) errors.push('Missing email.')
    else if (!EMAIL_PATTERN.test(row.email.trim())) errors.push('Invalid email format.')

    let duplicateOf = null
    if (email && errors.length === 0) {
      if (existingEmails.has(email)) duplicateOf = 'existing candidate'
      else if (seenInFile.has(email)) duplicateOf = 'another row in this file'
      seenInFile.add(email)
    }

    return {
      rowIndex: index,
      name: row.name?.trim() || '',
      email: row.email?.trim() || '',
      department: row.department?.trim() || 'Unassigned',
      joinDate: row.joinDate?.trim() || new Date().toISOString().slice(0, 10),
      supervisor: row.supervisor?.trim() || 'Unassigned',
      status: 'Active',
      errors,
      isValid: errors.length === 0,
      duplicateOf,
    }
  })
}
