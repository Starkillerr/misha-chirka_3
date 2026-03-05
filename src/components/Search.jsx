import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Search({ setSearch }) {
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setSearch(inputValue); // обновляем search в App/Home
      navigate(`/?q=${encodeURIComponent(inputValue)}`);
    }
  };

  return (
    <input
      type="search"
      className="search-input"
      placeholder="Що шукаєте?"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
}