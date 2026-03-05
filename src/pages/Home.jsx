import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../fetchproducts";
import { Footer } from "../components/Footer";
import ReactPaginate from "react-paginate";
import PriceSlider from "../components/PriceSlider";

export default function Home({ search }) {
  const [filterType, setFilterType] = useState("");
  const [products, setProducts] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const productsPerPage = 18;

  const loadProducts = async () => {
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
  };

  useEffect(() => {
    loadProducts();
  }, [currentPage, filterType, minPrice, maxPrice, search]);

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
          {products.length > 0 ? (
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
          />
        )}
      </main>

      <Footer />
    </div>
  );
}