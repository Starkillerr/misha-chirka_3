import { useState, useEffect } from "react";

export default function PriceSlider({ setMinPrice, setMaxPrice, min, max }) {
  const [range, setRange] = useState({ minValue: min, maxValue: max });
  const [debouncedRange, setDebouncedRange] = useState(range);

  // Твой дебаунс остается на месте — он отлично работает для обоих типов ввода
  useEffect(() => {
    const handler = setTimeout(() => {
      setMinPrice(debouncedRange.minValue);
      setMaxPrice(debouncedRange.maxValue);
    }, 300); 

    return () => clearTimeout(handler);
  }, [debouncedRange, setMinPrice, setMaxPrice]);

  // Обработчик для ползунка MIN
  const handleChangeMin = (e) => {
    const value = Number(e.target.value);
    setRange(r => ({ ...r, minValue: value }));
    setDebouncedRange(r => ({ ...r, minValue: value }));
  };

  // Обработчик для ползунка MAX
  const handleChangeMax = (e) => {
    const value = Number(e.target.value);
    setRange(r => ({ ...r, maxValue: value }));
    setDebouncedRange(r => ({ ...r, maxValue: value }));
  };

  // Обработчик для РУЧНОГО ввода MIN
  const handleInputChangeMin = (e) => {
    let value = e.target.value === "" ? 0 : Number(e.target.value);
    
    // Валидация: значение не должно быть больше текущего максимума и не меньше абсолютного минимума
    if (value > range.maxValue) value = range.maxValue;
    if (value < min) value = min;

    setRange(r => ({ ...r, minValue: value }));
    setDebouncedRange(r => ({ ...r, minValue: value }));
  };

  // Обработчик для РУЧНОГО ввода MAX
  const handleInputChangeMax = (e) => {
    let value = e.target.value === "" ? 0 : Number(e.target.value);
    
    // Валидация: значение не должно быть меньше текущего минимума и не больше абсолютного максимума
    if (value < range.minValue) value = range.minValue;
    if (value > max) value = max;

    setRange(r => ({ ...r, maxValue: value }));
    setDebouncedRange(r => ({ ...r, maxValue: value }));
  };

  return (
    <div className="price-filter">
      <input 
        className="slider"
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
      
      {/* Заменили текстовый блок на удобный контейнер с инпутами */}
      <div className="slider-inputs">
        <input
          type="number"
          className="price-input"
          min={min}
          max={range.maxValue}
          value={range.minValue === 0 && min !== 0 ? "" : range.minValue}
          onChange={handleInputChangeMin}
        />
        <span className="separator">–</span>
        <input
          type="number"
          className="price-input"
          min={range.minValue}
          max={max}
          value={range.maxValue === 0 ? "" : range.maxValue}
          onChange={handleInputChangeMax}
        />
        <span className="currency">грн</span>
      </div>
    </div>
  );
}