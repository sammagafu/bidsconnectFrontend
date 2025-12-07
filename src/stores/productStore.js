// src/stores/productStore.js
import { defineStore } from 'pinia';

export const useProductStore = defineStore('product', {
  state: () => ({
    step: 1,
    product: {
      name: '',
      type: '',
      category_id: null,
      subcategory_id: null,
      description: '',
      featured_image: null,
    },
    images: [],
    prices: [],
  }),
  actions: {
    addImage() {
      this.images.push({ image: null, caption: '', is_primary: false });
    },
    removeImage(index) {
      this.images.splice(index, 1);
    },
    addPrice() {
      this.prices.push({
        unit_price: 0,
        unit: '',
        minimum_quantity: 1,
        description: '',
        is_active: true,
      });
    },
    removePrice(index) {
      this.prices.splice(index, 1);
    },
    back() {
      if (this.step > 1) this.step--;
    },
    resetAll() {
      this.step = 1;
      this.product = { name: '', type: '', category_id: null, subcategory_id: null, description: '', featured_image: null };
      this.images = [];
      this.prices = [];
    },
  },
});