import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Footer } from "../components/Footer";
import { useCartStore } from "../stores/cartStore";
import { fetchReviews, addReview} from "../reviews"; 
import ProductPageSkeleton from "./ProductPageSkeleton";
export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const isInCart = useCartStore((state) => state.isInCart(id));
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("reviews"); 
  const [reviews, setReviews] = useState([]);
  const [newName, setNewName] = useState("");
  const [newReview, setNewReview] = useState("");

  const textLimit = 200;
  const shortText = product?.description?.slice(0, textLimit);
  const isLongText = product?.description?.length > textLimit;

  const handleClick = () => {
    if (isInCart) {
      removeItem(id);
    } else {
      addItem({
        id: product.id,
        title: product.name,
        price: product.price,
        image: product.image_url
      });
    }
  };

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Ошибка при загрузке продукта:", error);
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    async function loadReviews() {
      const data = await fetchReviews(id);
      setReviews(data);
    }

    loadReviews();
  }, [id]);

  const handleAddReview = async () => {
    const newRev = await addReview(id, newName, newReview);
    if (newRev) {
      setReviews([newRev, ...reviews]);
      setNewName("");
      setNewReview("");
    }
  };

  if (loading) return  <ProductPageSkeleton/>;
  if (!product) return <h2>Товар не знайдено</h2>;

  return (
    <>
      <main className="product-page">
        <div className="product-page__container">

          <div
            className="product-page__image"
            style={{ backgroundImage: `url(${product.image_url})` }}
          />

          <div className="product-page__info">
            <h1 className="product-page__name">{product.name}</h1> 
            <p className="about">
              {expanded ? product.description : shortText}
              {!expanded && isLongText && "... "}
              {isLongText && (
                <span className="expand_button" onClick={() => setExpanded(!expanded)}>
                  {expanded ? "Згорнути" : "Розгорнути"}
                </span>
              )}
            </p>
            <p className="product-price">{product.price} грн</p>

            <button className={`cart_button ${isInCart ? "in_cart" : ""}`} onClick={handleClick}>
              {isInCart ? 'В кошику' : 'Додати в кошик'}
            </button>
          </div>

        </div>
      </main>

      <footer className="page-footer">
  <div className="button_container">
    <button 
      className={`reviews_button ${activeTab === "reviews" ? "active" : ""}`}
      onClick={() => setActiveTab("reviews")}
    >
      Відгуки
    </button>
    <button 
      className={`stats_button ${activeTab === "stats" ? "active" : ""}`}
      onClick={() => setActiveTab("stats")}
    >
      Характеристики
    </button>
  </div>

  {/* Контент вкладок */}
  <div className="tab_content">
    {activeTab === "reviews" && (
      <div className="reviews_section">
        {/* Форма добавления отзыва */}
        <div className="add_review">
          <input 
            type="text" 
            placeholder="Ваше ім'я" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)}
          />
          <textarea 
            placeholder="Ваш відгук" 
            value={newReview} 
            onChange={(e) => setNewReview(e.target.value)}
          />
          <button onClick={handleAddReview}>Відправити</button>
        </div>

        <div className="reviews_list">
          {reviews.map((rev) => (
            <div key={rev.id} className="review_item">
              <strong>{rev.name}</strong>
              <p> {new Date(rev.created_at).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })}</p>
              <p>{rev.text}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {activeTab === "stats" && (
      <div className="stats_section">
        <p>Характеристики поки недоступні</p>
      </div>
    )}
  </div>
</footer>

      <Footer/>
    </>
  );
}