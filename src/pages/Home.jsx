import { useEffect, useState, useRef } from "react";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../fetchproducts";
import { Footer } from "../components/Footer";
import ReactPaginate from "react-paginate";
import PriceSlider from "../components/PriceSlider";
import ProductCardSkeleton from "../components/ProductCardSkeleton";

export default function Home({ search }) {
  const [filterType, setFilterType] = useState("");
  const [products, setProducts] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const productsPerPage = 18;

  // Флаг для предотвращения двойного запроса при одновременном изменении фильтра и страницы
  const isResettingPage = useRef(false);

  const loadProducts = async () => {
    setLoading(true);
    const { data, count } = await fetchProducts({
      page: currentPage + 1,
      limit: productsPerPage,
      category: filterType || undefined,
      minPrice,
      maxPrice,
      search: search || undefined,
    });
    setProducts(data);
    setTotalCount(count);
    setLoading(false);
  };

  // 1. Эффект для отслеживания фильтров. Если мы НЕ на 0 странице, сбрасываем её. 
  // Сам сброс страницы автоматически триггернет второй useEffect.
  useEffect(() => {
    if (currentPage !== 0) {
      isResettingPage.current = true;
      setCurrentPage(0);
    } else {
      // Если мы уже на 0 странице, изменения currentPage не будет, вызываем загрузку вручную
      loadProducts();
    }
  }, [filterType, minPrice, maxPrice, search]);

  // 2. Эффект, который отвечает за пагинацию и первичный рендер
  useEffect(() => {
    if (isResettingPage.current) {
      // Если страница изменилась из-за сброса фильтра, отменяем этот прогон, 
      // так как loadProducts() уже вызовется на следующем тике с актуальным стейтом
      isResettingPage.current = false;
      loadProducts();
      return;
    }
    
    loadProducts();
  }, [currentPage]);

  const pageCount = Math.ceil(totalCount / productsPerPage);

  return (
    <div className="app-wrapper">
      <main>
        <div className="main_pic"></div>
        <p className="main_text">МИ ТАМ, ДЕ СОНЦЕ</p>

        <div className="filters">
          <select
            className="custom-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Все Обладнання</option>
            <option value="panel">Сонячні Панелі</option>
            <option value="battery">Акумуляторні Батареї</option>
            <option value="inverter">Інвертори</option>
            <option value="automatic">Автоматичні Вимикачі</option>
          </select>

          <PriceSlider
            min={0}
            max={500000}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
          />
        </div>

        <div id="catalog" className="catalog-grid-container">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.name}
                price={product.price}
                image={product.image_url}
              />
            ))
          ) : (
            <p className="no-results">Нічого не знайдено</p>
          )}
        </div>

        {pageCount > 1 && (
          <ReactPaginate
            previousLabel={"←"}
            nextLabel={"→"}
            pageCount={pageCount}
            onPageChange={(e) => setCurrentPage(e.selected)}
            containerClassName={"pagination"}
            activeClassName={"active"}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            forcePage={currentPage} // Синхронизирует выбранную кнопку с кодом
          />
        )}
      </main>

      <Footer />
    </div>
  );
}