import { useState } from "react";

export default function PriceSlider({ setMinPrice, setMaxPrice, min, max }) {
  const [range, setRange] = useState({ minValue: min, maxValue: max });

  const handleChangeMin = (e) => {
    const value = Number(e.target.value);
    setRange(r => ({ ...r, minValue: value }));
    setMinPrice(value);
  };

  const handleChangeMax = (e) => {
    const value = Number(e.target.value);
    setRange(r => ({ ...r, maxValue: value }));
    setMaxPrice(value);
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
      <input
      className="slider"
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