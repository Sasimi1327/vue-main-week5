const { createApp } = Vue;
const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath ="sasimi"

//全部加入
Object.keys(VeeValidateRules).forEach(rule => {
  if (rule !== 'default') {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./i18n/zh_TW.json');

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const productModal = {
  props: ['id', 'addToCart', 'openModal'],
  data() {
    return {
      myModal: {},
      tempProduct: {},
      qty: 1
    }
  },
  template: '#userProductModal',
  watch: {
    id() {
      if(this.id){
        axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
            .then( res => {
              // console.log("單一產品: ", res.data.product);
              this.tempProduct = res.data.product;
              this.$emit('clearLoadingItem');
              this.myModal.show();
            })
            .catch( err => {
              Swal.fire({
                icon: "error",
                title: `錯誤 ${err.status}`,
                text: err.data.message,
                confirmButtonText: "OK",
              });
            })
      }
    }
  },
  methods: {
    closeModal() {
      this.qty = 1;
      this.myModal.hide();
    },
  },
  mounted() {
    // console.log(this.$refs);
    this.myModal = new bootstrap.Modal(this.$refs.modal);
    this.$refs.modal.addEventListener('hidden.bs.modal', event => {
      // 由於 id 是 props 進來的，為單向數據流，可emit 叫外層改
      this.openModal('');
    })
  }
}

const app = createApp({
  data() {
    return {
      products: [],
      cart: {},
      selectProductId: '',
      loadingItem: '', // 存 id
      user: {
        name: '',
        email: '',
        tel: '',
        address: '',
        message: ''
      },
    }
  },
  methods: {
    getProducts() {
      axios.get(`${apiUrl}/api/${apiPath}/products/all`)
          .then( res => {
            console.log("產品列表: ", res);
            this.products = res.data.products;
          })
          .catch( err => {
            Swal.fire({
              icon: "error",
              title: `錯誤 ${err.status}`,
              text: err.data.message,
              confirmButtonText: "OK",
            });
          })
    },
    openModal(id) {
      this.loadingItem = id;
      this.selectProductId = id;
    },
    addToCart(product_id, qty = 1) {
      const data = { // api 要求的結構
        product_id,
        qty
      }
      this.loadingItem = product_id;
      axios.post(`${apiUrl}/api/${apiPath}/cart`, { data })
          .then( res => {
            // console.log("加入購物車: ", res.data);
            this.$refs.productModal.closeModal();
            this.getCarts();
            this.loadingItem = '';
            Swal.fire({
              icon: "success",
              title: `${res.status === 200 ? "成功" : "失敗"}`,
              text: res.data.message,
              confirmButtonText: "OK",
            });
            // alert(res.data.message);
          })
          .catch( err => {
            Swal.fire({
              icon: "error",
              title: `錯誤 ${err.status}`,
              text: err.data.message,
              confirmButtonText: "OK",
            });
          })
    },
    getCarts() {
      axios.get(`${apiUrl}/api/${apiPath}/cart`)
          .then( res => {
            console.log("購物車: ", res.data);
            this.cart = res.data.data;
          })
          .catch( err => {
            Swal.fire({
              icon: "error",
              title: `錯誤 ${err.status}`,
              text: err.data.message,
              confirmButtonText: "OK",
            });
          })
    },
    // product_id: 產品的 ID
    // id: 購物車的 ID
    updateCartItem(item) {
      const data = {
        product_id: item.product_id,
        qty: item.qty
      }
      this.loadingItem = item.id;
      axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, {data})
          .then( res => {
            // console.log("更新購物車: ", res.data);
            this.getCarts();
            this.loadingItem = ''
            Swal.fire({
              icon: "success",
              title: `${res.status === 200 ? "成功" : "失敗"}`,
              text: res.data.message,
              confirmButtonText: "OK",
            });
            // alert(res.data.message);
          })
          .catch( err => {
            Swal.fire({
              icon: "error",
              title: `錯誤 ${err.status}`,
              text: err.data.message,
              confirmButtonText: "OK",
            });
          })
    },
    deleteCartItem(item) {
      this.loadingItem = item.id;
      axios.delete(`${apiUrl}/api/${apiPath}/cart/${item.id}`)
          .then( res => {
            // console.log("刪除購物車: ", res.data);
            this.getCarts();
            this.loadingItem = '';
            Swal.fire({
              icon: "success",
              title: `${res.status === 200 ? "成功" : "失敗"}`,
              text: res.data.message,
              confirmButtonText: "OK",
            });
            // alert(res.data.message);
          })
          .catch( err => {
            Swal.fire({
              icon: "error",
              title: `錯誤 ${err.status}`,
              text: err.data.message,
              confirmButtonText: "OK",
            });
          })
    },
    clearAll() {
      axios.delete(`${apiUrl}/api/${apiPath}/carts`)
          .then( res => {
            // console.log("刪除(全部)購物車: ", res.data);
            this.getCarts();
            Swal.fire({
              icon: "success",
              title: `${res.status === 200 ? "成功" : "失敗"}`,
              text: res.data.message,
              confirmButtonText: "OK",
            });
            // alert(res.data.message);
          })
          .catch( err => {
            Swal.fire({
              icon: "error",
              title: `錯誤 ${err.status}`,
              text: err.data.message,
              confirmButtonText: "OK",
            });
          })
    },
    clearLoadingItem() {
      this.loadingItem = '';
    },
    onSubmit(values) {
      // // 購物車需要清除原本項目
      const data = {
        user: {
          name: this.user.name,
          email: this.user.email,
          tel: this.user.tel,
          address: this.user.address
        },
        message: this.user.message
      }
      axios.post(`${apiUrl}/api/${apiPath}/order`, { data })
          .then( res => {
            // console.log("結帳: ", res.data);
            this.getCarts();
            Swal.fire({
              icon: "success",
              title: `${res.status === 200 ? "成功" : "失敗"}`,
              text: res.data.message,
              confirmButtonText: "OK",
            });
            // alert(res.data.message);
            //清空表單 input
            this.user.message = '';
            this.$refs.form.resetForm();
          })
          .catch( err => {
            Swal.fire({
              icon: "error",
              title: `錯誤 ${err.status}`,
              text: err.data.message,
              confirmButtonText: "OK",
            });
          })

    },
  },
  components: {
    productModal
  },
  mounted() {
    this.getProducts();
    this.getCarts();
  }
});

app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app');