import { Routes, Route } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import AiAssistant from './components/AiAssistant';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login/*" element={<Login />} />
          <Route path="/sign-up/*" element={
            <div className="flex justify-center items-start py-12 px-4">
              <SignUp routing="path" path="/sign-up" signInUrl="/login" afterSignUpUrl="/" />
            </div>
          } />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
      </main>
      <AiAssistant />
    </div>
  );
}
