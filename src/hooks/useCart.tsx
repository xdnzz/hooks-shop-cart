import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart];
      const existPath = updatedCart.find(product => product.id === productId);
      const getPath = await api.get(`/products/${productId}`);
      const getAmount = getPath.data.amount;
      const validAmount = existPath ? existPath.amount : 0;
      const getNewAmount = validAmount + 1;
      if(getNewAmount > getAmount) {
      toast.error('Quantidade solicitada fora do estoque')
      }
      if(existPath) {
        existPath.amount = getNewAmount;
      } else {
        const getNewPath = await api.get(`/products/${productId}`)
        const setNewData = {
          ...getNewPath.data,
          amount: 1
        }
        updatedCart.push(setNewData)
        }
        setCart(updatedCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    }catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart]
      const filterData = cart.findIndex(product => product.id === productId)
      if(filterData >= 0) {
        updatedCart.slice(filterData, 1)
        setCart(updatedCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(filterData))
      } else {
        throw Error()
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
