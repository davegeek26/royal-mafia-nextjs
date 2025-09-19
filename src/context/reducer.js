const saveToLocalStorage = (key, data) => {
    try {
        // Check if localStorage is available
        if (typeof(Storage) === "undefined") {
            console.warn('localStorage is not available');
            return false;
        }
        
        // Check if we're in private/incognito mode (limited storage)
        const testKey = '__localStorage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        
        // Save the data
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.warn('Failed to save to localStorage:', error);
        return false;
    }
};

const loadFromLocalStorage = (key, defaultValue) => {
    try {
        // Check if localStorage is available
        if (typeof(Storage) === "undefined") {
            console.warn('localStorage is not available');
            return defaultValue;
        }
        
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue;
        }
        
        const parsed = JSON.parse(item);
        
        // Validate the data structure
        if (!Array.isArray(parsed)) {
            console.warn('Invalid cart data in localStorage, using default');
            return defaultValue;
        }
        
        // Additional validation: check if items have required properties
        const isValid = parsed.every(item => 
            item && 
            typeof item === 'object' && 
            item.id !== undefined &&
            item.title !== undefined &&
            item.price !== undefined
        );
        
        if (!isValid) {
            console.warn('Invalid cart item structure in localStorage, using default');
            return defaultValue;
        }
        
        return parsed;
    } catch (error) {
        console.warn('Failed to load from localStorage:', error);
        return defaultValue;
    }
};

export const initialState = {
    basket: loadFromLocalStorage('royal-mafia-cart', []),
    user: null,
};

const reducer = (state, action) => {
    console.log(action);
    let newState;
    
    switch(action.type){
        case 'ADD_TO_CART':
            newState = {
                ...state,
                basket: [...state.basket, action.item],
            };
            break;

        case 'REMOVE_FROM_CART':
            const index = state.basket.findIndex(
                (basketItem) => basketItem.id === action.id
            );
            let newBasket = [...state.basket];
            
            if (index >= 0) {
                newBasket.splice(index, 1);
            } else {
                console.warn(
                    `Can't remove product (id: ${action.id}) as it's not in basket!`
                );
            }
            
            newState = {
                ...state,
                basket: newBasket,
            };
            break;
            
        case 'REMOVE_ALL_FROM_CART':
            newState = {
                ...state,
                basket: state.basket.filter(item => item.id !== action.id),
            };
            break;
            

            
        case 'EMPTY_CART':
            newState = {
                ...state,
                basket: [],
            };
            break;
            
        case 'SET_USER':
            newState = {
                ...state,
                user: action.user,
            };
            break;
            
        default:
            return state;
    }
    
    // Save to localStorage after each action (except for the default case)
    if (newState) {
        saveToLocalStorage('royal-mafia-cart', newState.basket);
    }
    
    return newState || state;
};

export default reducer;

// Utility function to calculate basket total
export const getBasketTotal = (basket) => {
    return basket?.reduce((amount, item) => item.price + amount, 0) || 0;
};

// Utility function to clear cart from localStorage
export const clearCartFromStorage = () => {
    try {
        localStorage.removeItem('royal-mafia-cart');
        console.log('Cart cleared from localStorage');
        return true;
    } catch (error) {
        console.warn('Failed to clear cart from localStorage:', error);
        return false;
    }
};
