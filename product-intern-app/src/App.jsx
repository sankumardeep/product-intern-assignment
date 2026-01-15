import { useState, useEffect, useMemo } from 'react';
import { fetchAndStoreData, getProducts, deleteProductAPI, updateProductAPI, addProductAPI } from './api';
import './App.css';

const App = () => {
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filterState, setFilterState] = useState({ 
    brand: '', 
    category: '',
    minPrice: 0,
    maxPrice: Infinity,
    minRating: 0
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    category: '',
    price: '',
    rating: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const worked = await fetchAndStoreData(); 
      if (worked) {
        const fetched = await getProducts(); 
        setProductList(fetched);
      } else {
        setErrorMsg("Couldn't load products. Check your connection.");
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const applyFilters = useMemo(() => {
    return productList.filter(item => {
      const brandMatch = filterState.brand ? item.brand === filterState.brand : true;
      const catMatch = filterState.category ? item.category === filterState.category : true;
      const priceMatch = item.price >= filterState.minPrice && item.price <= filterState.maxPrice;
      const ratingMatch = item.rating >= filterState.minRating;
      return brandMatch && catMatch && priceMatch && ratingMatch;
    });
  }, [productList, filterState]);

  // Options are derived from currently available results,
  // always respecting the *other* active filters.
  const brandOptions = useMemo(() => {
    const scoped = productList.filter(item => {
      const categoryOk = filterState.category ? item.category === filterState.category : true;
      const priceOk = item.price >= filterState.minPrice && item.price <= filterState.maxPrice;
      const ratingOk = item.rating >= filterState.minRating;
      return categoryOk && priceOk && ratingOk;
    });

    const unique = [...new Set(scoped.map(item => item.brand))];
    return unique.sort();
  }, [productList, filterState.category, filterState.minPrice, filterState.maxPrice, filterState.minRating]);

  const categoryOptions = useMemo(() => {
    const scoped = productList.filter(item => {
      const brandOk = filterState.brand ? item.brand === filterState.brand : true;
      const priceOk = item.price >= filterState.minPrice && item.price <= filterState.maxPrice;
      const ratingOk = item.rating >= filterState.minRating;
      return brandOk && priceOk && ratingOk;
    });

    const unique = [...new Set(scoped.map(item => item.category))];
    return unique.sort();
  }, [productList, filterState.brand, filterState.minPrice, filterState.maxPrice, filterState.minRating]);

  const priceOptions = useMemo(() => {
    const scoped = productList.filter(item => {
      const brandOk = filterState.brand ? item.brand === filterState.brand : true;
      const categoryOk = filterState.category ? item.category === filterState.category : true;
      const ratingOk = item.rating >= filterState.minRating;
      return brandOk && categoryOk && ratingOk;
    });
    
    if (scoped.length === 0) return [];
    
    return [
      { text: 'All Prices', min: 0, max: Infinity },
      { text: 'Under $50', min: 0, max: 50 },
      { text: '$50 - $100', min: 50, max: 100 },
      { text: '$100 - $200', min: 100, max: 200 },
      { text: '$200 - $500', min: 200, max: 500 },
      { text: 'Over $500', min: 500, max: Infinity }
    ];
  }, [productList, filterState.brand, filterState.category, filterState.minRating]);

  const ratingOptions = useMemo(() => {
    const scoped = productList.filter(item => {
      const brandOk = filterState.brand ? item.brand === filterState.brand : true;
      const categoryOk = filterState.category ? item.category === filterState.category : true;
      const priceOk = item.price >= filterState.minPrice && item.price <= filterState.maxPrice;
      return brandOk && categoryOk && priceOk;
    });

    const uniqueRatings = [...new Set(scoped.map(item => Math.floor(item.rating)))]
      .filter(val => !Number.isNaN(val))
      .sort((a, b) => b - a);

    const base = [{ text: 'All Ratings', val: 0 }];
    const dynamic = uniqueRatings.map(val => ({
      text: `${val}+ Stars`,
      val,
    }));

    return base.concat(dynamic);
  }, [productList, filterState.brand, filterState.category, filterState.minPrice, filterState.maxPrice]);

  const updateFilter = (key, val) => {
    setFilterState(prev => ({ ...prev, [key]: val }));
  };

  const removeProduct = async (id) => {
    const backup = [...productList];
    setProductList(productList.filter(item => item.id !== id));
    try {
      await deleteProductAPI(id);
    } catch (err) {
      setProductList(backup);
      alert("Delete failed. Try again.");
    }
  };

  const saveTitle = async (id, title) => {
    setProductList(prev => prev.map(item => item.id === id ? { ...item, title } : item));
    await updateProductAPI(id, title);
  };

  const submitProduct = async () => {
    if (!formData.title || !formData.brand || !formData.category || !formData.price || !formData.rating) {
      alert('All fields required');
      return;
    }

    try {
      const added = await addProductAPI({
        title: formData.title,
        brand: formData.brand,
        category: formData.category,
        price: parseFloat(formData.price),
        rating: parseFloat(formData.rating)
      });
      setProductList([...productList, added]);
      setFormData({ title: '', brand: '', category: '', price: '', rating: '' });
      setShowForm(false);
      alert('Product added!');
    } catch (err) {
      alert('Add failed.');
    }
  };

  const changeInput = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const clearFilters = () => {
    setFilterState({ brand: '', category: '', minPrice: 0, maxPrice: Infinity, minRating: 0 });
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (errorMsg) {
    return <div className="app-error">{errorMsg}</div>;
  }

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">⚡</div>
          <div>
            <h1>ProductHub</h1>
            <p className="tagline">Smart Inventory Management</p>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <section className="controls-section">
          <div className="filter-container">
            <div className="filter-item">
              <label className="filter-label">Brand</label>
              <select 
                value={filterState.brand} 
                onChange={(e) => updateFilter('brand', e.target.value)}
                className="filter-select"
              >
                <option value="">All Brands</option>
                {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="filter-item">
              <label className="filter-label">Category</label>
              <select 
                value={filterState.category} 
                onChange={(e) => updateFilter('category', e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="filter-item">
              <label className="filter-label">Price Range</label>
              <select 
                value={`${filterState.minPrice}-${filterState.maxPrice === Infinity ? 'inf' : filterState.maxPrice}`} 
                onChange={(e) => {
                  const parts = e.target.value.split('-');
                  updateFilter('minPrice', Number(parts[0]));
                  updateFilter('maxPrice', parts[1] === 'inf' ? Infinity : Number(parts[1]));
                }}
                className="filter-select"
              >
                {priceOptions.map(opt => (
                  <option key={opt.text} value={`${opt.min}-${opt.max === Infinity ? 'inf' : opt.max}`}>{opt.text}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label className="filter-label">Min Rating</label>
              <select 
                value={filterState.minRating} 
                onChange={(e) => updateFilter('minRating', Number(e.target.value))}
                className="filter-select"
              >
                {ratingOptions.map(opt => (
                  <option key={opt.val} value={opt.val}>{opt.text}</option>
                ))}
              </select>
            </div>

            <button onClick={clearFilters} className="btn-reset">Clear All</button>
            <button onClick={() => setShowForm(!showForm)} className="btn-add">+ New Product</button>
          </div>
        </section>

        {showForm && (
          <section className="form-section">
            <h2 className="form-title">Add Product</h2>
            <div className="form-layout">
              <div className="input-field">
                <label>Product Name</label>
                <input 
                  type="text"
                  placeholder="Product name"
                  value={formData.title}
                  onChange={(e) => changeInput('title', e.target.value)}
                  className="text-input"
                />
              </div>

              <div className="input-field">
                <label>Brand</label>
                <input 
                  type="text"
                  placeholder="Brand name"
                  value={formData.brand}
                  onChange={(e) => changeInput('brand', e.target.value)}
                  className="text-input"
                />
              </div>

              <div className="input-field">
                <label>Category</label>
                <input 
                  type="text"
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) => changeInput('category', e.target.value)}
                  className="text-input"
                />
              </div>

              <div className="input-field">
                <label>Price ($)</label>
                <input 
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => changeInput('price', e.target.value)}
                  className="text-input"
                />
              </div>

              <div className="input-field">
                <label>Rating</label>
                <input 
                  type="number"
                  placeholder="0-5"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => changeInput('rating', e.target.value)}
                  className="text-input"
                />
              </div>
            </div>

            <div className="form-buttons">
              <button onClick={submitProduct} className="btn-save">Save</button>
              <button onClick={() => setShowForm(false)} className="btn-cancel">Cancel</button>
            </div>
          </section>
        )}

        <section className="table-section">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applyFilters.length > 0 ? (
                  applyFilters.map(item => (
                    <TableRow 
                      key={item.id} 
                      item={item} 
                      onDelete={removeProduct} 
                      onUpdate={saveTitle}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      <span className="empty-icon">🔍</span>
                      <span>No products match your filters</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

const TableRow = ({ item, onDelete, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.title);

  const finishEdit = () => {
    setEditing(false);
    if (editValue !== item.title && editValue.trim() !== "") {
      onUpdate(item.id, editValue);
    } else {
      setEditValue(item.title);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      finishEdit();
    }
  };

  return (
    <tr className="table-row">
      <td className="cell-id">{item.id}</td>
      <td className="cell-editable" onClick={() => setEditing(true)}>
        {editing ? (
          <input 
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={finishEdit}
            onKeyDown={handleKeyPress}
            className="edit-input"
          />
        ) : (
          <span className="product-name">{item.title}</span>
        )}
      </td>
      <td className="cell-brand">{item.brand}</td>
      <td className="cell-category">{item.category}</td>
      <td className="cell-price">${item.price.toFixed(2)}</td>
      <td className="cell-rating">
        <span className="rating-display">{item.rating.toFixed(1)} ⭐</span>
      </td>
      <td className="cell-actions">
        <button className="btn-delete" onClick={() => onDelete(item.id)}>Remove</button>
      </td>
    </tr>
  );
};

export default App;
