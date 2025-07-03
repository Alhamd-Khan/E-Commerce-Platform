import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Download, Eye } from 'lucide-react';
import { useOrders } from '../contexts/OrderContext';

export const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { getOrderById } = useOrders();
  
  const order = orderId ? getOrderById(orderId) : null;
  const displayOrderId = order?.id || Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Order Number</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{displayOrderId}</p>
          {order?.trackingNumber && (
            <p className="text-sm text-gray-600 mt-2">
              Tracking: {order.trackingNumber}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Estimated Delivery</h3>
            <p className="text-gray-600">3-5 business days</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Shipping Method</h3>
            <p className="text-gray-600">Standard Shipping</p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Download Receipt</span>
          </button>
          
          <Link
            to="/orders"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Order Details</span>
          </Link>
          
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="mt-12 text-left bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">1.</span>
              We'll send you a confirmation email with tracking information
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">2.</span>
              Your order will be processed and shipped within 24 hours
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">3.</span>
              You'll receive updates via email and SMS as your order progresses
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};