
let localData = []; 

export const initializeData = async () => {
  
};

export const getProducts = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...localData]);
    }, 500);
  });
};

export const deleteProduct = (id) => {
    
};