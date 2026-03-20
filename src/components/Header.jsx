import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Menu from "./Menu";
import CartPopup from "./CartPopup";
import { supabase } from "../supabaseClient";
import { useCartStore } from "../stores/cartStore";
import CheckoutPage from "./CheckoutPage";

export default function Header({ search, setSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [inputValue, setInputValue] = useState(search || "");
  const [focused, setFocused] = useState(false);
  const [products, setProducts] = useState([]);
  const items = useCartStore((state) => state.items);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Ошибка при загрузке продуктов в Header:", error);
      } else {
        setProducts(data || []);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter((p) => p.name?.toLowerCase().includes(inputValue.toLowerCase()))
    .slice(0, 3);

  const triggerSearch = () => {
    setSearch(inputValue); // обновляем search на Home
    navigate(`/?q=${encodeURIComponent(inputValue)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      triggerSearch();
    }
  };

  const totalCartItems = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <header className="header">
        <div className="header__left">
          <div className="page-logo">
            <a className="page-img" href="/"></a>
          </div>

          <div className="phone">
            <a className="phone-logo" href="tel:+380687777777">
              <img src="/imgs/Icon-Phone-call.png" alt="call" />
            </a>
            <a href="tel:+380687777777" className="icon-phone">
              <p className="icon-phone__text">+380 68 777 7777</p>
            </a>
          </div>
        </div>

        <div className="header__center">
          <Link className="card__name" to="/services">
            ПОСЛУГИ
          </Link>
          <Link className="card__name" to="/#catalog">
            ОБЛАДНАННЯ І МАТЕРІАЛИ
          </Link>
          <Link className="card__name" to="/">
            ВИКЛИК СПЕЦІАЛІСТА
          </Link>
        </div>

        <div className="header__right">
          <div className="search" style={{ position: "relative" }}>
            <img
              src="./imgs/search.png"
              alt="search"
              className="search-icon-left"
              onClick={triggerSearch}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                width: "20px",
                height: "20px",
              }}
            />
            <input
              type="search"
              className="search-input"
              placeholder="Що шукаєте?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
            />

            {inputValue && (
              <span
                className="search-clear"
                onClick={() => setInputValue("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#888",
                  userSelect: "none",
                }}
              >
                ×
              </span>
            )}

           {inputValue && focused && filteredProducts?.length > 0 && (
  <ul className="search-dropdown">
    {filteredProducts.map((p) => (
      <li
        key={p.id}
        onClick={() => navigate(`/product/${p.id}`)}
        style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
      >
        {p.image_url && (
          <img
            src={p.image_url}
            alt={p.name}
            style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
          />
        )}
        <span>{p.name} — {p.price} грн</span>
      </li>
    ))}
  </ul>
)}
          </div>

          <div className="top-bar">
            <div
              className="top-bar_cart"
              onClick={() => setCartOpen(true)}
              style={{ position: "relative", cursor: "pointer" }}
            >
              {totalCartItems > 0 && (
                <span
                  className="cart-badge"
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "red",
                    color: "#fff",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "12px",
                  }}
                >
                  {totalCartItems}
                </span>
              )}
            </div>

            <a
              className="top-barlogo"
              onClick={() => setMenuOpen(true)}
            ></a>
          </div>
        </div>
      </header>

      <Menu open={menuOpen} close={() => setMenuOpen(false)} />
      <CartPopup
  open={cartOpen}
  close={() => setCartOpen(false)}
  openCheckout={() => {
    setCartOpen(false);
    setCheckoutOpen(true);
  }}
/>
<CheckoutPage
  open={checkoutOpen}
  close={() => setCheckoutOpen(false)}
/>
    </>
  );
}