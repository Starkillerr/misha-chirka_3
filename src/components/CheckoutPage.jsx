import { useEffect, useState } from "react";
import { useCartStore } from "../stores/cartStore";
import PhoneInput from "react-phone-input-2";
import { useRef } from "react";
import "react-phone-input-2/lib/style.css";

export default function CheckoutPage({ open, close }) {
  const items = useCartStore((state) => state.items);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const [cityInput, setCityInput] = useState("");
  const [cities, setCities] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [deliveryCost, setDeliveryCost] = useState(0);
 const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [middleName, setMiddleName] = useState("");
  const [phone, setPhone] = useState("");
  const phoneRef = useRef(null);
  const middleNameRef = useRef(null);
  const lastNameRef = useRef(null);

  const API_BASE = "http://localhost:4000";

 

  useEffect(() => {
    if (cityInput.length < 2) {
      setCities([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetch(`${API_BASE}/api/np-cities?name=${encodeURIComponent(cityInput)}`)
        .then(res => res.json())
        .then(data => setCities(data || []))
        .catch(err => console.error("Ошибка городов:", err));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [cityInput]);

  useEffect(() => {
    if (!selectedCity) {
      setWarehouses([]);
      setDeliveryCost(0);
      return;
    }

    fetch(`${API_BASE}/api/np-warehouses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cityRef: selectedCity.Ref })
    })
      .then(res => res.json())
      .then(data => setWarehouses(data || []))
      .catch(err => console.error("Ошибка отделений:", err));

    fetch(`${API_BASE}/api/np-cost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cityRef: selectedCity.Ref,
        weight: 1,
        cost: totalAmount
      })
    })
      .then(res => res.json())
      .then(data => setDeliveryCost(Number(data.cost) || 0))
      .catch(err => console.error("Ошибка цены:", err));
  }, [selectedCity, totalAmount]);

  const handlePay = async () => {
    if (!firstName || !middleName || !lastName || !phone || !selectedCity || !selectedWarehouse) {
      alert("Будь ласка, заповніть всі дані доставки!");
      return;
    }

    try {
      const order_id = `ORDER-${Date.now()}`;
      const amount = totalAmount + deliveryCost;

      const res = await fetch(`${API_BASE}/api/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, order_id })
      });

      const { data, signature } = await res.json();

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://www.liqpay.ua/api/3/checkout";

      const appendInput = (n, v) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = n;
        input.value = v;
        form.appendChild(input);
      };

      appendInput("data", data);
      appendInput("signature", signature);

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      alert("Помилка при з'єднанні з сервером оплати");
    }
  };
 if (!open) return null;
  return (
    <div className="cart-popup" style={{ display: "flex" }} onClick={close}>
      <div
        className="cart-popup__content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <span className="cart-popup__close" onClick={close}>
          &times;
        </span>

        <div className="checkout-page" style={{ padding: "20px" }}>
          <h1>Оформлення замовлення</h1>

          <div className="customer-info" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input
              type="text"
              placeholder="Ім'я"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    lastNameRef.current.focus();
                }
              }}
              style={{ padding: "10px" }}
            />
            <input
              type="text"
              ref={lastNameRef}
              placeholder="Прізвище"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
               onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    middleNameRef.current.focus();
                }
              }}
              style={{ padding: "10px" }}
            />
            <input
              type="text"
              ref={middleNameRef}
              placeholder=" По-батькові"
              value={middleName}
              onChange={e => setMiddleName(e.target.value)}
               onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    phoneRef.current.focus();
                }
              }}
              style={{ padding: "10px" }}
            />

          <PhoneInput
  
  country={"ua"}
  onlyCountries={["ua"]}
  enableSearch={true}
 placeholder="+380 XX XXX XX XX"
  value={phone}
  onChange={(phone) => setPhone("+" + phone)}
   inputProps={{
    ref: phoneRef,
  }}
  inputStyle={{
    width: "100%",
    height: "40px"
  }}
/>
          </div>

          <div className="delivery-info" style={{ marginTop: "20px" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Введіть місто (напр. Київ)"
                value={cityInput}
                onChange={(e) => {
                  setCityInput(e.target.value);
                  if (selectedCity) setSelectedCity(null);
                }}
                style={{ width: "100%", padding: "10px" }}
              />

              {cities.length > 0 && !selectedCity && (
                <ul style={{
                  border: "1px solid #ccc",
                  position: "absolute",
                  background: "#fff",
                  width: "100%",
                  zIndex: 100,
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  maxHeight: "150px",
                  overflowY: "auto"
                }}>
                  {cities.map(city => (
                    <li
                      key={city.Ref}
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #eee",
                        cursor: "pointer",
                        color: "#000"
                      }}
                      onClick={() => {
                        setSelectedCity(city);
                        setCityInput(city.Description);
                        setCities([]);
                      }}
                    >
                      {city.Description}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedCity && (
              <select
                style={{ marginTop: "10px", width: "100%", padding: "10px" }}
                onChange={e => setSelectedWarehouse(e.target.value)}
              >
                <option value="">-- Оберіть відділення --</option>

                {warehouses.map(w => (
                  <option key={w.Ref} value={w.Ref}>
                    {w.Description}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="summary" style={{ marginTop: "20px", padding: "15px", background: "#f9f9f9", color: "#000" }}>
            <p>Товари: {totalAmount} грн</p>
            <p>Доставка: {deliveryCost} грн</p>
            <hr />
            <h3>Всього: {totalAmount + deliveryCost} грн</h3>
          </div>

          <button
          className="checkout_button"
            onClick={handlePay}
            style={{
              width: "100%",
              padding: "15px",
              marginTop: "10px",
              color: "#fff",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            ОПЛАТИТИ ТА ЗАМОВИТИ
          </button>
        </div>
      </div>
    </div>
  );
}