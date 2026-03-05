import { Link } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";

function ProductCard({ id, title, price, image }) {
     const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const isInCart = useCartStore((state) => state.isInCart(id));

  const handleClick = () => {
    if (isInCart) {
      removeItem(id);
    } else {
      addItem({ id, title, price, image });
    }
  };

  return (
    <div className="catalog-card">
      <Link
        to={`/product/${id}`}
        className="catalog-card__image"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="catalog-card__info">
        <Link to={`/product/${id}`} className="catalog-card__name">
          {title}
        </Link>
        <p className="catalog-card__price">{price} грн</p>
        <button className="add-to-cart" onClick={handleClick}>{isInCart ?  'В кошику' : 'Додати в кошик'}
      </button>
      </div>
    </div>
  )
}

export default ProductCard