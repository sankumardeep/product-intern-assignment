// src/api.js
let localCache = [];

export const fetchAndStoreData = async () => {
  try {
    const response = await fetch('https://dummyjson.com/products?limit=100'); 
    const data = await response.json();
    localCache = data.products.map(p => ({
      id: p.id,
      title: p.title,
      brand: p.brand || 'Generic',
      category: p.category,
      price: p.price,
      rating: p.rating
    }));
    return true;
  } catch (error) {
    console.error("Failed to fetch initial data", error);
    return false;
  }
};

export const getProducts = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...localCache]);
    }, 800); 
  });
};

export const deleteProductAPI = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localCache = localCache.filter(product => product.id !== id);
      resolve({ success: true });
    }, 500);
  });
};

export const updateProductAPI = (id, newTitle) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = localCache.findIndex(p => p.id === id);
      if (index !== -1) {
        localCache[index] = { ...localCache[index], title: newTitle };
      }
      resolve({ success: true });
    }, 500);
  });
};