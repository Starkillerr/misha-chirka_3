import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import { Link } from "react-router-dom";

export default function ProductCardSkeleton() {
  return (
    <div className="catalog-card">
      <Link
        to="#"
        className="catalog-card__image"
        style={{  minHeight: 150, display: "block" }}
      >
        <Skeleton height={150} width="100%" />
      </Link>

      <div  style={{ padding: '8px 0' }}>
        <div style={{ marginBottom: 6 }}>
          <Skeleton width="80%" height={20} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <Skeleton width="40%" height={20} />
        </div>

        <div>
          <Skeleton width="60%" height={30} />
        </div>
      </div>
    </div>
  );
}   