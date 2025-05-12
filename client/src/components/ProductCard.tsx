import { Link } from "wouter";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const {
    id,
    name,
    brand,
    imageUrl,
    price,
    discountedPrice,
    discountPercentage,
    rating,
    reviewCount,
    deliveryTime
  } = product;
  
  return (
    <div className="bg-white rounded shadow-sm overflow-hidden product-card transition-all duration-200">
      <Link href={`/product/${id}`} className="block">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-48 object-contain p-4"
          loading="lazy"
        />
        <div className="p-3">
          <div className="text-xs text-primary font-medium">{brand.toUpperCase()}</div>
          <h3 className="font-medium text-dark mb-1 truncate" title={name}>{name}</h3>
          <div className="flex items-center mb-1">
            <span className="rating-badge mr-2">{rating} ★</span>
            <span className="text-xs text-gray-500">({reviewCount.toLocaleString()})</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-dark">₹{discountedPrice ? discountedPrice.toLocaleString() : price.toLocaleString()}</span>
            {discountedPrice && (
              <>
                <span className="text-xs text-gray-500 line-through ml-2">₹{price.toLocaleString()}</span>
                <span className="text-xs text-success ml-2">{discountPercentage}% off</span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">{deliveryTime}</div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <button 
          onClick={() => onAddToCart(product)}
          className="btn-secondary w-full py-2 text-sm"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
