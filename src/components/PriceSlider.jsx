import { useState, useEffect } from "react";

export default function PriceSlider({ setMinPrice, setMaxPrice, min, max }) {
  const [range, setRange] = useState({ minValue: min, maxValue: max });

  const [debouncedRange, setDebouncedRange] = useState(range);

  useEffect(() => {
    const handler = setTimeout(() => {
      setMinPrice(debouncedRange.minValue);
      setMaxPrice(debouncedRange.maxValue);
    }, 300); 

    return () => clearTimeout(handler);
  }, [debouncedRange, setMinPrice, setMaxPrice]);

  const handleChangeMin = (e) => {
    const value = Number(e.target.value);
    setRange(r => ({ ...r, minValue: value }));
    setDebouncedRange(r => ({ ...r, minValue: value }));
  };

  const handleChangeMax = (e) => {
    const value = Number(e.target.value);
    setRange(r => ({ ...r, maxValue: value }));
    setDebouncedRange(r => ({ ...r, maxValue: value }));
  };

  return (
    <div className="price-filter">
      <input className="slider"
        type="range"
        min={min}
        max={max}
        value={range.minValue}
        onChange={handleChangeMin}
      />
      <input className="slider"
        type="range"
        min={min}
        max={max}
        value={range.maxValue}
        onChange={handleChangeMax}
      />
      <div className="slider-text">
        {range.minValue} грн – {range.maxValue} грн
      </div>
    </div>
  );
}