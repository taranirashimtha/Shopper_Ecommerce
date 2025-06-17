import React, { useContext } from 'react';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';
import './CartItems.css';

const CartItems = () => {
  const { all_product, cartItems, addToCart, removeFromCart } = useContext(ShopContext);

  const subtotal = all_product.reduce((sum, product) => {
    const quantity = cartItems[product.id] || 0;
    return sum + product.new_price * quantity;
  }, 0);

  // Shipping fee is free
  const shippingFee = 0;

  const total = subtotal + shippingFee;
  const removeAllFromCart = (itemId) => {
    removeFromCart(itemId); 
  };


  return (
    <div className='cartitems'>
      <div className="cartitems-format-main">
        <p>Product</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />

      {all_product.map((product) => {
        const quantity = cartItems[product.id] || 0;
        if (quantity > 0) {
          return (
            <div className="cartitems-format" key={product.id}>
              <img src={product.image} alt={product.name} className='carticon-product-icon' />
              <p>{product.name}</p>
              <p>${product.new_price.toFixed(2)}</p>
              <div className='cartitems-quantity'>
                <button onClick={() => removeFromCart(product.id)}>-</button>
                <span>{quantity}</span>
                <button onClick={() => addToCart(product.id)}>+</button>
              </div>
              <p>${(product.new_price * quantity).toFixed(2)}</p>
              <img
                src={remove_icon}
                onClick={() => removeAllFromCart(product.id)}
                alt="Remove"
                className="cart-remove-icon"
                style={{ cursor: 'pointer' }}
                title="Remove all"
              />
            </div>
          );
        }
        return null;
      })}
      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>cart totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>subtotal</p>
              <p>${subtotal.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>shipping fee</p>
              <p>free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>total</p>
              <p>${total.toFixed(2)}</p>
            </div>
          </div>
          <button>Proceed to checkout</button>
        </div>
        <div className="cartitems-promocode">
          <p>if have promo code, enter it here</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder='promo code' />
            <button>submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
