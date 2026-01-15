let productData = [];

export const fetchAndStoreData = async () => {
  try {
    const res = await fetch('https://dummyjson.com/products?limit=100'); 
    const json = await res.json();
    productData = json.products.map(item => ({
      id: item.id,
      title: item.title,
      brand: item.brand || 'Generic',
      category: item.category,
      price: item.price,
      rating: item.rating
    }));
    return true;
  } catch (err) {
    console.error("Fetch error:", err);
    return false;
  }
};

export const getProducts = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...productData]);
    }, 700); 
  });
};

export const deleteProductAPI = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      productData = productData.filter(item => item.id !== id);
      resolve({ success: true });
    }, 400);
  });
};

export const updateProductAPI = (id, title) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const idx = productData.findIndex(item => item.id === id);
      if (idx !== -1) {
        productData[idx] = { ...productData[idx], title };
      }
      resolve({ success: true });
    }, 400);
  });
};

export const addProductAPI = (product) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const maxId = productData.length > 0 ? Math.max(...productData.map(item => item.id)) : 0;
      const newItem = {
        id: maxId + 1,
        title: product.title,
        brand: product.brand,
        category: product.category,
        price: product.price,
        rating: product.rating
      };
      productData.push(newItem);
      resolve(newItem);
    }, 400);
  });
};

