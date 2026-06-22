import React from 'react';
import Icon from './Icon';

export default function NumberInput({ value, onChange, min, max, step = 1, ...props }) {
  const changeBy = (direction) => {
    const increment = Number(step);
    const current = Number(value === '' ? min || 0 : value);
    const precision = String(step).split('.')[1]?.length || 0;
    const next = Number((current + direction * increment).toFixed(precision));
    onChange(String(Math.min(Number(max ?? next), Math.max(Number(min ?? next), next))));
  };
  return <div className="number-input"><input type="number" value={value} onChange={(event)=>onChange(event.target.value)} min={min} max={max} step={step} {...props}/><span className="number-input-controls"><button type="button" onClick={()=>changeBy(1)} aria-label="Zwiększ wartość"><Icon name="chevronUp" size={12}/></button><button type="button" onClick={()=>changeBy(-1)} aria-label="Zmniejsz wartość"><Icon name="chevronDown" size={12}/></button></span></div>;
}
