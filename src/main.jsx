import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// import 'bulma/css/bulma.min.css';
import './site-index.css'
import './site-catalog.css'
import './product.css'
import './card-page.css'
import './services.css'
import './cart.css'
import './paginate.css'
import'./reviews.css'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)