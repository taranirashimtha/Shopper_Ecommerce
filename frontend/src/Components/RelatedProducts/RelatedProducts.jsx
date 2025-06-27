import React, { useContext } from 'react';
import './RelatedProducts.css';
import Item from '../Item/Item';
import { ShopContext } from '../../Context/ShopContext';
import { useParams } from 'react-router-dom';

const RelatedProducts = () => {
  const { all_product } = useContext(ShopContext);
  const { productId } = useParams();

  // ✅ Get the current product by ID
  const currentProduct = all_product.find((p) => p.id === Number(productId));

  // ✅ Filter related products by same category but different ID
  const relatedProducts = all_product.filter(
    (item) =>
      item.category.toLowerCase() === currentProduct?.category?.toLowerCase() &&
      item.id !== Number(productId)
  );

  return (
    <div className='relatedproducts'>
      <h1>Related Products</h1>
      <hr />
      <div className='relatedproducts-item'>
        {relatedProducts.length > 0 ? (
          relatedProducts.map((item) => (
            <Item
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        ) : (
          <p>No related products found.</p>
        )}
      </div>
    </div>
  );
};

export default RelatedProducts;