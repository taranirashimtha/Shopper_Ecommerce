import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
    const [all_product, setAll_Product] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [loading, setLoading] = useState(true); // ✅ Handle loading state

    // ✅ Fetch products and user's cart
    useEffect(() => {
        fetch("http://localhost:5000/allproducts")
            .then((res) => res.json())
            .then((data) => {
                console.log("📦 Products Fetched:", data);
                setAll_Product(data);

                const token = localStorage.getItem("auth-token");
                if (token) {
                    fetch("http://localhost:5000/getcart", {
                        method: "POST",
                        headers: {
                            "auth-token": token,
                            "Content-Type": "application/json",
                        },
                    })
                        .then((res) => res.json())
                        .then((data) => {
                            if (data.success && data.cartData) {
                                console.log("🧺 Cart Restored:", data.cartData);
                                setCartItems(data.cartData);
                            } else {
                                console.warn("⚠ Cart not restored, fallback to empty.");
                                setCartItems({});
                            }
                            setLoading(false);
                        })
                        .catch((err) => {
                            console.error("❌ Cart fetch error:", err);
                            setCartItems({});
                            setLoading(false);
                        });
                } else {
                    setCartItems({});
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error("❌ Product fetch error:", err);
                setLoading(false);
            });
    }, []);

    // ✅ Add to Cart
    const addToCart = (itemId) => {
        const updatedCart = {
            ...cartItems,
            [itemId]: (cartItems[itemId] || 0) + 1,
        };
        setCartItems(updatedCart);

        const token = localStorage.getItem("auth-token");
        if (token) {
            fetch("http://localhost:5000/addtocart", {
                method: "POST",
                headers: {
                    "auth-token": token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ itemId }),
            }).catch((err) => console.error("❌ Add sync error:", err));
        }
    };

    // ✅ Remove one item
    const removeFromCart = (itemId) => {
        const updatedCart = {
            ...cartItems,
            [itemId]: Math.max((cartItems[itemId] || 0) - 1, 0),
        };
        setCartItems(updatedCart);

        const token = localStorage.getItem("auth-token");
        if (token) {
            fetch("http://localhost:5000/removefromcart", {
                method: "POST",
                headers: {
                    "auth-token": token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ itemId }),
            }).catch((err) => console.error("❌ Remove sync error:", err));
        }
    };

    // ✅ Remove all quantity (frontend only)
    const removeAllFromCart = (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: 0,
        }));
    };

    // ✅ Sync entire cart to MongoDB (optional use)
    const syncCartToDB = () => {
        const token = localStorage.getItem("auth-token");
        if (token) {
            fetch("http://localhost:5000/updatecart", {
                method: "POST",
                headers: {
                    "auth-token": token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ cartData: cartItems }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        console.log("✅ Cart saved to DB");
                    }
                })
                .catch((err) => console.error("❌ Cart sync error:", err));
        }
    };

    // ✅ Get total items in cart
    const getTotalCartItems = () => {
        return Object.values(cartItems).reduce((acc, qty) => acc + qty, 0);
    };

    // ✅ Log on cart change
    useEffect(() => {
        console.log("🧺 Cart Updated:", cartItems);
    }, [cartItems]);

    const contextValue = {
        all_product,
        cartItems,
        addToCart,
        removeFromCart,
        removeAllFromCart,
        getTotalCartItems,
        syncCartToDB,
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {!loading ? props.children : <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;