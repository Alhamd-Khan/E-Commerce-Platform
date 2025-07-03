// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { Order, CartItem } from '../types';
// import { useAuth } from './AuthContext';
// import axios from 'axios';

// interface OrderContextType {
//   orders: Order[];
//   addOrder: (items: CartItem[], total: number, tax: number, shippingAddress: any, paymentMethod: string) => Promise<string>;
//   getOrderById: (orderId: string) => Order | undefined;
//   getUserOrders: (userId: string) => Order[];
//   updateOrderStatus: (orderId: string, status: string) => void;
// }

// const OrderContext = createContext<OrderContextType | undefined>(undefined);

// export const useOrders = () => {
//   const context = useContext(OrderContext);
//   if (!context) {
//     throw new Error('useOrders must be used within an OrderProvider');
//   }
//   return context;
// };

// interface OrderProviderProps {
//   children: ReactNode;
// }

// export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const { user } = useAuth();

//   useEffect(() => {
//     async function fetchOrders() {
//       if (!user) {
//         setOrders([]);
//         return;
//       }
//       try {
//         let res;
//         if (user.isAdmin) {
//           res = await axios.get('/api/orders', {
//             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//           });
//         } else {
//           res = await axios.get(`/api/orders/user/${user.id}`, {
//             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//           });
//         }
//         setOrders(res.data.map((order: any) => ({
//           ...order,
//           id: order._id || order.id,
//           userId: order.user || order.userId
//         })));
//       } catch {
//         setOrders([]);
//       }
//     }
//     fetchOrders();
//   }, [user]);

//   const addOrder = async (
//     items: CartItem[], 
//     total: number, 
//     tax: number, 
//     shippingAddress: any, 
//     paymentMethod: string
//   ): Promise<string> => {
//     if (!user) throw new Error('User must be logged in to place an order');
//     const res = await axios.post('/api/orders', {
//       items,
//       total,
//       tax,
//       shippingAddress: {
//         fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
//         street: shippingAddress.address,
//         city: shippingAddress.city,
//         state: shippingAddress.state,
//         zipCode: shippingAddress.zipCode,
//         country: shippingAddress.country,
//         phone: shippingAddress.phone
//       },
//       paymentMethod
//     }, {
//       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//     });
//     // Refetch orders after adding
//     if (user.isAdmin) {
//       const allOrders = await axios.get('/api/orders', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
//       setOrders(allOrders.data.map((order: any) => ({
//         ...order,
//         id: order._id || order.id,
//         userId: order.user || order.userId
//       })));
//     } else {
//       const userOrders = await axios.get(`/api/orders/user/${user.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
//       setOrders(userOrders.data.map((order: any) => ({
//         ...order,
//         id: order._id || order.id,
//         userId: order.user || order.userId
//       })));
//     }
//     return res.data.id || res.data._id;
//   };

//   const getOrderById = (orderId: string): Order | undefined => {
//     return orders.find(order => order.id === orderId);
//   };

//   const getUserOrders = (userId: string): Order[] => {
//     return orders.filter(order => order.userId === userId).sort((a, b) => 
//       new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//     );
//   };

//   const updateOrderStatus = (orderId: string, status: string) => {
//     setOrders(prevOrders => {
//       const updated = prevOrders.map(order =>
//         order.id === orderId
//           ? { ...order, status: status as Order["status"], updatedAt: new Date().toISOString() }
//           : order
//       );
//       return updated;
//     });
//   };

//   return (
//     <OrderContext.Provider value={{
//       orders,
//       addOrder,
//       getOrderById,
//       getUserOrders,
//       updateOrderStatus
//     }}>
//       {children}
//     </OrderContext.Provider>
//   );
// };

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, CartItem } from '../types';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[], total: number, tax: number, shippingAddress: any, paymentMethod: string) => string;
  getOrderById: (orderId: string) => Order | undefined;
  getUserOrders: (userId: string) => Order[];
  updateOrderStatus: (orderId: string, status: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Load orders from localStorage on mount
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  useEffect(() => {
    // Save orders to localStorage whenever they change
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (
    items: CartItem[], 
    total: number, 
    tax: number, 
    shippingAddress: any, 
    paymentMethod: string
  ): string => {
    if (!user) throw new Error('User must be logged in to place an order');

    const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const trackingNumber = `TRK${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      items,
      total,
      tax,
      status: 'confirmed',
      shippingAddress: {
        fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        street: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone
      },
      paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingNumber
    };

    setOrders(prevOrders => [newOrder, ...prevOrders]);
    return orderId;
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  };

  const getUserOrders = (userId: string): Order[] => {
    return orders.filter(order => order.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const updateOrderStatus = (orderId: string, status: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      )
    );
  };

  return (
    <OrderContext.Provider value={{
      orders,
      addOrder,
      getOrderById,
      getUserOrders,
      updateOrderStatus
    }}>
      {children}
    </OrderContext.Provider>
  );
};