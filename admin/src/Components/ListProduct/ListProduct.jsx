import React, { useState, useEffect } from 'react';
import './ListProduct.css';
import cross_icon from '../../assets/cross_icon.png';

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);

  const fetchInfo = async () => {
    try {
      const res = await fetch('http://localhost:5000/allproducts');
      const data = await res.json();
      setAllProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []); // <-- Empty dependency array to avoid infinite re-renders

  const remove_product = async() => {
    await fetch('http://localhost:5000/removeproduct',{
      method: 'POST',
      headers : {
        Accept:'application/json',
        'Content-Type' : 'application/json',

      },
      body:JSON.stringify({id:id})
    })
    await fetchInfo();
  }


  return (
    <div className='list-product'>
      <h1> All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product, index) => (
          <div key={index} className="listproduct-format-main listproduct">
            <img src={product.image} alt="product" className='listproduct-product-image' />
            <p>{product.name}</p>
            <p>${product.old_price}</p>
            <p>${product.new_price}</p>
            <p>{product.category}</p>
            <img onClick={()=>{remove_product(product.id)}} className='listproduct-remove-icon' src={cross_icon} alt="Remove" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;
