export default function FormField({ label, name, value, error, onChange, type = 'text', textarea = false, autoComplete, placeholder, options = [], minLength, maxLength, required = false, rows = 4, ...props }) {
  const baseProps = {
    id: `field-${name}`,
    name,
    value,
    onChange,
    autoComplete,
    placeholder,
    minLength,
    maxLength,
    required,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `error-${name}` : undefined,
    ...props,
  }

  return (
    <div className="field-group">
      <label htmlFor={`field-${name}`}>{label}</label>

      {textarea ? (
        <textarea {...baseProps} rows={rows} />
      ) : type === 'select' ? (
        <select {...baseProps} value={value || ''}>
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </select>
      ) : (
        <input {...baseProps} type={type} />
      )}

      {error && (
        <small id={`error-${name}`} className="field-error" role="alert">
          {error}
        </small>
      )}
    </div>
  )
}
