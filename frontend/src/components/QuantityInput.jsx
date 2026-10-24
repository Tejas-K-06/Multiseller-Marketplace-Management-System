export default function QuantityInput({ value, min = 1, max, onChange, label = 'Quantity' }) {
  function update(nextValue) {
    const number = Math.max(min, Math.min(max, Number(nextValue) || min))
    onChange(number)
  }

  return <div className="qty" aria-label={label}><button type="button" aria-label={`Decrease ${label.toLowerCase()}`} onClick={() => update(value - 1)} disabled={value <= min}>−</button><input aria-label={label} inputMode="numeric" value={value} min={min} max={max} onChange={(event) => update(event.target.value)} /><button type="button" aria-label={`Increase ${label.toLowerCase()}`} onClick={() => update(value + 1)} disabled={value >= max}>+</button></div>
}
