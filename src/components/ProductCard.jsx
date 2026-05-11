import { Link } from 'react-router-dom';
import StarRating from './StarRating';

export default function ProductCard({ product, avgRating, reviewCount }) {
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-thumb">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              'https://via.placeholder.com/600x600?text=No+Image';
          }}
        />
        {product.isHot && <span className="hot-tag">HOT</span>}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">{product.price.toLocaleString()}원</p>
        <div className="rating-row">
          <StarRating value={avgRating ?? 0} size={14} />
          <span className="muted">
            {avgRating ? avgRating.toFixed(1) : '–'} ({reviewCount ?? 0})
          </span>
        </div>
      </div>
    </Link>
  );
}
