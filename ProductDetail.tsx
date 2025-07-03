import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, ChevronLeft, Plus, Minus } from 'lucide-react';
import { useProducts } from '../contexts/ProductsContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products } = useProducts();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();
  const { user, addToWishlist, removeFromWishlist } = useAuth();
  const { addReview } = useProducts();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const isWishlisted = user && user.wishlist && user.wishlist.includes(product.id);
  const [shareMsg, setShareMsg] = useState('');

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
        <Link to="/" className="text-blue-600 hover:text-blue-700">
          Return to shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
  };

  const discountPercentage = product.discount
    ? Math.round(Number(product.discount))
    : (product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0);

  // Calculate the original price if discount is set
  const calculatedOriginalPrice = product.discount
    ? (product.price / (1 - Number(product.discount) / 100))
    : product.originalPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to products</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="relative mb-4">
            {product.discount && (
              <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-md font-medium">
                -{discountPercentage}%
              </div>
            )}
            
            <img
              src={product.images[selectedImage] || product.image}
              alt={product.name}
              className="w-full h-96 lg:h-[500px] object-cover rounded-xl"
            />
          </div>

          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Brand & Category */}
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {product.brand}
            </span>
            <span className="text-sm text-gray-600">{product.category}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center mb-6">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600 ml-2">
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-3xl font-bold text-gray-900">
              ₹{product.price}
            </span>
            {(product.discount || product.originalPrice) && (
              <span className="text-xl text-gray-500 line-through">
                ₹{calculatedOriginalPrice && calculatedOriginalPrice.toFixed(2)}
              </span>
            )}
            {product.discount && (
              <span className="text-green-600 font-medium">
                Save {discountPercentage}%
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.inStock ? (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{product.stock} in stock</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Out of stock</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-8 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4 mb-8">
            <span className="font-medium text-gray-900">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-all ${
                product.inStock
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
            </button>

            <button
              onClick={() => {
                if (!user) return window.location.href = '/login';
                if (isWishlisted) {
                  removeFromWishlist(product.id);
                } else {
                  addToWishlist(product.id);
                }
              }}
              className={`flex items-center justify-center space-x-2 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${isWishlisted ? 'bg-pink-50 border-pink-200' : ''}`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'text-pink-500 fill-current' : ''}`} />
              <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
            </button>

            <button
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href);
                setShareMsg('Product link copied!');
                setTimeout(() => setShareMsg(''), 2000);
              }}
              className="flex items-center justify-center space-x-2 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
            {shareMsg && <span className="text-green-600 ml-2">{shareMsg}</span>}
          </div>

          {/* Reviews Section */}
          <div className="max-w-2xl mx-auto mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6 mb-10">
                {product.reviews.slice().reverse().map((review, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                      <span className="ml-3 text-gray-900 font-medium">{review.userName}</span>
                      <span className="ml-3 text-gray-500 text-xs">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 mb-10">No reviews yet. Be the first to review this product!</p>
            )}

            {/* Review Form */}
            {user ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!reviewForm.rating || !reviewForm.comment.trim()) return;
                  setSubmitting(true);
                  await new Promise(res => setTimeout(res, 500));
                  addReview(product.id, {
                    userId: user.id,
                    userName: user.name,
                    rating: reviewForm.rating,
                    comment: reviewForm.comment,
                    date: new Date().toISOString(),
                  });
                  setReviewForm({ rating: 0, comment: '' });
                  setSubmitting(false);
                }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
                <div className="flex items-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                      className="focus:outline-none"
                    >
                      <Star className={`w-7 h-7 ${reviewForm.rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    </button>
                  ))}
                  <span className="ml-3 text-gray-700">{reviewForm.rating ? `${reviewForm.rating} out of 5` : 'Select rating'}</span>
                </div>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                  rows={3}
                  placeholder="Write your review here..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  required
                />
                <button
                  type="submit"
                  disabled={submitting || !reviewForm.rating || !reviewForm.comment.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <p className="text-gray-600">Please <Link to="/login" className="text-blue-600 hover:underline">log in</Link> to write a review.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};