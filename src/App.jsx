import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import ProductPage from "./pages/ProductPage";
import { useState } from "react";
import { Services } from "./pages/Services";
import CheckoutPage from './components/CheckoutPage'

export default function App() {
 const [search, setSearch] = useState('');
 
    return (
    <>
      <Header search={search} setSearch={setSearch}  />

      <Routes>
        <Route path="/" element={<Home search={search} />} />
        <Route path="/product/:id" element={<ProductPage />} />
         <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/Services" element={<Services/>}/>
      </Routes>
    </>
  );
}