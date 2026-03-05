import { useCartStore } from "../stores/cartStore";

export default function CartPopup({ open, close }) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQty = useCartStore((state) => state.updateQty);

  if (!open) return null;

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <div
      className="cart-popup"
      style={{ display: "flex" }}
      onClick={close}
    >
      <div
        className="cart-popup__content"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="cart-popup__close" onClick={close}>
          &times;
        </span>

        {items.length === 0 && <div className="cart_image"></div>}

        {items.length === 0 ? (
          <p>Наразі кошик порожній</p>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item" style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                  <img src={item.image} alt={item.name} style={{ width: 50, height: 50, marginRight: 10 }} />
                  <div style={{ flex: 1 }}>
                    <p className="item-name">{item.name}</p>
                    <p className="item-price">{item.price} грн</p>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <button className="plus-minus" onClick={() => updateQty(item.id, item.qty > 1 ? item.qty - 1 : 1)}>-</button>
                      <span style={{ margin: "0 5px" }}>{item.qty}</span>
                      <button className="plus-minus" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    </div>
                  </div>
                  <button className="cart-delete" onClick={() => removeItem(item.id)}>Видалити</button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <p>Товарів: {totalItems}</p>
              <p>Сума: {totalAmount} грн</p>
            </div>
            <button className="cart-order">Перейти до оформлення</button>
          </>
        )}
      </div>
    </div>
  );
}