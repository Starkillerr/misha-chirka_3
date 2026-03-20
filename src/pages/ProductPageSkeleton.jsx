import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

export default function ProductPageSkeleton() {
  return (
    <>
      <main className="product-page">
        <div className="product-page__container">

          {/* Заглушка для картинки */}
          <div className="product-page__image" style={{ backgroundColor: "#eee", minHeight: 300 }}>
            <Skeleton height={300} width="100%" />
          </div>

          <div className="product-page__info">
            {/* Заглушка для названия */}
            <Skeleton width="60%" height={30} style={{ marginBottom: 12 }} />

            {/* Заглушка для описания */}
            <Skeleton count={3} width="100%" height={20} style={{ marginBottom: 12 }} />

            {/* Заглушка для цены */}
            <Skeleton width="30%" height={25} style={{ marginBottom: 12 }} />

            {/* Заглушка для кнопки */}
            <Skeleton width="50%" height={40} />
          </div>

        </div>
      </main>

      <footer className="page-footer">
        {/* Заглушка вкладок */}
        <div className="button_container" style={{ marginBottom: 12 }}>
          <Skeleton width="100px" height={30} style={{ marginRight: 8 }} />
          <Skeleton width="120px" height={30} />
        </div>

        {/* Заглушка контента вкладок */}
        <div className="tab_content">
          <Skeleton count={3} width="100%" height={20} style={{ marginBottom: 8 }} />
          <Skeleton count={2} width="90%" height={20} style={{ marginBottom: 8 }} />
        </div>
      </footer>
    </>
  );
}