// src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { fetchAndStoreData, getProducts, deleteProductAPI, updateProductAPI } from './api';
import './App.css'; 

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ 
    brand: '', 
    category: '',
    minPrice: 0,
    maxPrice: Infinity,
    minRating: 0
  });

  // Initial Data Load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const success = await fetchAndStoreData(); 
      if (success) {
        const data = await getProducts(); 
        setProducts(data);
      } else {
        setError("Failed to load data.");
      }
      setLoading(false);
    };
    init();
  }, []);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesBrand = filters.brand ? product.brand === filters.brand : true;
      const matchesCategory = filters.category ? product.category === filters.category : true;
      const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice;
      const matchesRating = product.rating >= filters.minRating;
      return matchesBrand && matchesCategory && matchesPrice && matchesRating;
    });
  }, [products, filters]);

  // Dependent Dropdowns
  const availableBrands = useMemo(() => {
    const relevantProducts = filters.category 
      ? products.filter(p => p.category === filters.category)
      : products;
    return [...new Set(relevantProducts.map(p => p.brand))].sort();
  }, [products, filters.category]);

  const availableCategories = useMemo(() => {
    const relevantProducts = filters.brand 
      ? products.filter(p => p.brand === filters.brand)
      : products;
    return [...new Set(relevantProducts.map(p => p.category))].sort();
  }, [products, filters.brand]);

  // Get unique price ranges from current filtered products
  const availablePriceRanges = useMemo(() => {
    const tempFiltered = products.filter(product => {
      const matchesBrand = filters.brand ? product.brand === filters.brand : true;
      const matchesCategory = filters.category ? product.category === filters.category : true;
      const matchesRating = product.rating >= filters.minRating;
      return matchesBrand && matchesCategory && matchesRating;
    });
    
    if (tempFiltered.length === 0) return [];
    
    const prices = tempFiltered.map(p => p.price).sort((a, b) => a - b);
    const minPrice = Math.floor(prices[0]);
    const maxPrice = Math.ceil(prices[prices.length - 1]);
    
    return [
      { label: `All Prices`, min: 0, max: Infinity },
      { label: `Under $50`, min: 0, max: 50 },
      { label: `$50 - $100`, min: 50, max: 100 },
      { label: `$100 - $200`, min: 100, max: 200 },
      { label: `$200 - $500`, min: 200, max: 500 },
      { label: `Over $500`, min: 500, max: Infinity }
    ];
  }, [products, filters.brand, filters.category, filters.minRating]);

  // Get unique ratings from current filtered products
  const availableRatings = useMemo(() => {
    const tempFiltered = products.filter(product => {
      const matchesBrand = filters.brand ? product.brand === filters.brand : true;
      const matchesCategory = filters.category ? product.category === filters.category : true;
      const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice;
      return matchesBrand && matchesCategory && matchesPrice;
    });
    
    return [
      { label: 'All Ratings', value: 0 },
      { label: '4+ Stars', value: 4 },
      { label: '3+ Stars', value: 3 },
      { label: '2+ Stars', value: 2 }
    ];
  }, [products, filters.brand, filters.category, filters.minPrice, filters.maxPrice]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDelete = async (id) => {
    const oldProducts = [...products];
    setProducts(products.filter(p => p.id !== id));
    try {
      await deleteProductAPI(id);
    } catch (err) {
      setProducts(oldProducts);
      alert("Failed to delete.");
    }
  };

  const handleUpdateTitle = async (id, newTitle) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, title: newTitle } : p));
    await updateProductAPI(id, newTitle);
  };

  if (loading) return <div className="loading">Loading Product Data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <h1>Product Inventory</h1>
      
      <div className="filter-bar">
        <div className="filter-group">
          <label>Brand:</label>
          <select value={filters.brand} onChange={(e) => handleFilterChange('brand', e.target.value)}>
            <option value="">All Brands</option>
            {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
            <option value="">All Categories</option>
            {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Price Range:</label>
          <select 
            value={`${filters.minPrice}-${filters.maxPrice}`} 
            onChange={(e) => {
              const [min, max] = e.target.value.split('-');
              handleFilterChange('minPrice', Number(min));
              handleFilterChange('maxPrice', Number(max));
            }}
          >
            {availablePriceRanges.map(range => (
              <option key={range.label} value={`${range.min}-${range.max}`}>{range.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Minimum Rating:</label>
          <select value={filters.minRating} onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}>
            {availableRatings.map(rating => (
              <option key={rating.value} value={rating.value}>{rating.label}</option>
            ))}
          </select>
        </div>

        <button onClick={() => setFilters({ brand: '', category: '', minPrice: 0, maxPrice: Infinity, minRating: 0 })} className="reset-btn">Reset Filters</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name (Editable)</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductRow 
                  key={product.id} 
                  product={product} 
                  onDelete={handleDelete} 
                  onUpdate={handleUpdateTitle}
                />
              ))
            ) : (
              <tr><td colSpan="6" className="no-results">No results found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ProductRow = ({ product, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(product.title);

  const handleBlur = () => {
    setIsEditing(false);
    if (tempTitle !== product.title && tempTitle.trim() !== "") {
      onUpdate(product.id, tempTitle);
    } else {
      setTempTitle(product.title);
    }
  };

  return (
    <tr>
      <td>{product.id}</td>
      <td className="editable-cell" onClick={() => setIsEditing(true)}>
        {isEditing ? (
          <input 
            autoFocus
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            className="title-input"
          />
        ) : (
          <span>{product.title}</span>
        )}
      </td>
      <td>{product.brand}</td>
      <td>{product.category}</td>
      <td>${product.price}</td>
      <td>
        <button className="delete-btn" onClick={() => onDelete(product.id)}>Delete</button>
      </td>
    </tr>
  );
};

export default App;