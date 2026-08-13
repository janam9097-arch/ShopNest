import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../services/cartService';

// Load guest cart from localStorage
const loadGuestCart = () => {
  try {
    const cart = localStorage.getItem('guest_cart');
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items) => {
  localStorage.setItem('guest_cart', JSON.stringify(items));
};

const initialState = {
  items: loadGuestCart(),
  isLoading: false,
  error: null,
  couponCode: '',
  discount: 0,
};

// Thunks for authenticated cart operations
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product, quantity = 1 }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (auth.isAuthenticated) {
      try {
        const response = await cartService.addItem(product.id, quantity);
        return response.data.data || response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
      }
    }
    // Guest cart handled in reducer
    return { product, quantity, isGuest: true };
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (auth.isAuthenticated) {
      try {
        const response = await cartService.updateItem(itemId, quantity);
        return response.data.data || response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
      }
    }
    return { itemId, quantity, isGuest: true };
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (auth.isAuthenticated) {
      try {
        const response = await cartService.removeItem(itemId);
        return response.data.data || response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
      }
    }
    return { itemId, isGuest: true };
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (auth.isAuthenticated) {
      try {
        await cartService.clearCart();
        return {};
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
      }
    }
    return { isGuest: true };
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addGuestItem: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === product.id
      );
      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({ product, quantity, id: `guest-${Date.now()}` });
      }
      saveGuestCart(state.items);
    },
    updateGuestItem: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((i) => i.id === itemId);
      if (item) {
        item.quantity = quantity;
      }
      saveGuestCart(state.items);
    },
    removeGuestItem: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveGuestCart(state.items);
    },
    clearGuestCart: (state) => {
      state.items = [];
      saveGuestCart([]);
    },
    setCoupon: (state, action) => {
      state.couponCode = action.payload;
    },
    setDiscount: (state, action) => {
      state.discount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.isGuest) {
          const { product, quantity = 1 } = action.payload;
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );
          if (existingIndex >= 0) {
            state.items[existingIndex].quantity += quantity;
          } else {
            state.items.push({ product, quantity, id: `guest-${Date.now()}` });
          }
          saveGuestCart(state.items);
        } else {
          state.items = action.payload.items || [];
        }
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.isGuest) {
          const { itemId, quantity } = action.payload;
          const item = state.items.find((i) => i.id === itemId);
          if (item) {
            item.quantity = quantity;
          }
          saveGuestCart(state.items);
        } else {
          state.items = action.payload.items || [];
        }
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.isGuest) {
          state.items = state.items.filter((i) => i.id !== action.payload.itemId);
          saveGuestCart(state.items);
        } else {
          state.items = action.payload.items || [];
        }
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.couponCode = '';
        state.discount = 0;
        saveGuestCart([]);
      });
  },
});

export const {
  addGuestItem,
  updateGuestItem,
  removeGuestItem,
  clearGuestCart,
  setCoupon,
  setDiscount,
} = cartSlice.actions;
export default cartSlice.reducer;
