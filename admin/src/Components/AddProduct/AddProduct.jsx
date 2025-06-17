import React, { useState } from 'react';
import './AddProduct.css';
import upload_area from '../../assets/upload_area.svg';

const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "Women",
    new_price: "",
    old_price: ""
  });

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
    setProductDetails({ ...productDetails, image: e.target.files[0].name });
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const Add_Product = async () => {
    console.log(productDetails);
    let responseData;
    let product = productDetails;

    // Upload image first
    let formData = new FormData();
    formData.append('product', image);

    await fetch('/upload', {   
      method: 'POST',
      body: formData,
    })
    .then((resp) => resp.json())
    .then((data) => { responseData = data });

    if (responseData.image_url) {  // ✅ fixed here (match backend response)
      product.image = responseData.image_url;

      // Then upload product details after image uploaded
      await fetch('/addproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("✅ Product Added Successfully");
          setProductDetails({
            name: "",
            image: "",
            category: "Women",
            new_price: "",
            old_price: ""
          });
          setImage(null);
        } else {
          alert("❌ Failed to add product");
        }
      });
    }
  };

  return (
    <div className='add-product'>
      <div className="addproduct_itemfield">
        <p>Product title</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name='name'
          placeholder='Type here'
        />
      </div>
      <div className='addproduct-price'>
        <div className="addproduct_itemfield">
          <p>Price</p>
          <input
            value={productDetails.old_price}
            onChange={changeHandler}
            type="text"
            name="old_price"
            placeholder='Type'
          />
        </div>
        <div className="addproduct_itemfield">
          <p>Offer Price</p>
          <input
            value={productDetails.new_price}
            onChange={changeHandler}
            type="text"
            name="new_price"
            placeholder='Type'
          />
        </div>
      </div>
      <div className="addproduct_itemfield">
        <p>Product Category</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className='add-product-selector'
        >
          <option value="Women">Women</option>
          <option value="Men">Men</option>
          <option value="Kid">Kid</option>
        </select>
      </div>
      <div className="addproduct_itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            className='addproduct-thumbnail-img'
            alt=""
          />
        </label>
        <input onChange={imageHandler} type="file" name='image' id='file-input' hidden />
      </div>
      <button onClick={Add_Product} className='addproduct-btn'>ADD</button>
    </div>
  );
};

export default AddProduct;