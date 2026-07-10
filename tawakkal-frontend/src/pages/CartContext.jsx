import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('cartItems');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Failed to parse cart items from localStorage", error);
            return [];
        }
    });

    const [wishlistItems, setWishlistItems] = useState(() => {
        try {
            const localData = localStorage.getItem('wishlistItems');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Failed to parse wishlist items", error);
            return [];
        }
    });

    const [notification, setNotification] = useState(null);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
    };

    const toggleWishlist = (product) => {
        setWishlistItems((prev) => {
            const exists = prev.find(item => item.id === product.id);
            if (exists) {
                showNotification(`${product.name} removed from wishlist`, 'info');
                return prev.filter(item => item.id !== product.id);
            }
            showNotification(`${product.name} added to wishlist!`);
            return [...prev, product];
        });
    };

    const addToCart = (product, quantity = 1, selectedSize, selectedColor, isWholesale = false) => {
        setCartItems((prevItems) => {
            const existingItemIndex = prevItems.findIndex(
                (item) =>
                    item.id === product.id &&
                    item.selectedSize === selectedSize &&
                    item.selectedColor?.name === selectedColor?.name &&
                    item.isWholesale === isWholesale
            );

            showNotification(`${product.name} ${isWholesale ? '(Wholesale)' : ''} added to bag!`);

            if (existingItemIndex > -1) {
                return prevItems.map((item, i) =>
                    i === existingItemIndex
                        ? { ...item, quantity: item.quantity + (quantity || 1) }
                        : item
                );
            } else {
                const itemPrice = isWholesale ? product.wholesale_price : (product.base_price || product.price);
                return [...prevItems, { 
                    ...product, 
                    price: itemPrice, 
                    quantity: (quantity || 1), 
                    selectedSize, 
                    selectedColor,
                    isWholesale,
                    image: product.primary_image?.image_url || product.image || "https://placehold.co/400x533?text=No+Image"
                }];
            }
        });
    };

    const removeFromCart = (productId, selectedSize, selectedColorName) => {
        setCartItems((prevItems) =>
            prevItems.filter(
                (item) =>
                    !(item.id === productId &&
                        item.selectedSize === selectedSize &&
                        item.selectedColor?.name === selectedColorName)
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const value = {
        cartItems,
        wishlistItems,
        notification,
        addToCart,
        removeFromCart,
        clearCart,
        toggleWishlist,
        setNotification
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};