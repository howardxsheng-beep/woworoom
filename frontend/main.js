const BASE_URL = 'https://livejs-api.hexschool.io/api/livejs/v1';
const API_PATH = 'ho';

let cartData = {};
let products = [];
const productListDOM = document.querySelector('.productWrap');
const productFilterDOM = document.querySelector('.productSelect');
const productListElDOM = document.querySelector('.productWrap');
const shoopingCartDOM = document.querySelector('.shoppingCart-table');

async function fetchProducts() {
    const res = await axios.get(`${BASE_URL}/customer/${API_PATH}/products`);
    return res.data.products;
}

async function fetchCart() {
    const res = await axios.get(`${BASE_URL}/customer/${API_PATH}/carts`);
    return res.data;
}

async function init() {
    try {
        products = await fetchProducts();
        renderList(products);

        cartData = await fetchCart();
        console.log(cartData);
        renderCart(cartData);

    } catch (error) {
        console.error("失敗：", error);
    }
}



function renderList(dataToRender) {
    const listHTML = dataToRender.map((product) => {
        return `
        <li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${product.images}" alt="">
                <a href="#" class="addCardBtn" data-id=${product.id}>加入購物車</a>
                <h3>${product.title}</h3>
                <del class="originPrice">NT$${product.origin_price}</del>
                <p class="nowPrice">NT$${product.price}</p>
            </li>
        `
    }).join("");
    productListDOM.innerHTML = listHTML;
}

function addCart(){

}

function renderCart(cartApiData) {
  // cartApiData 是整包：{ carts: [...], total, finalTotal }
  const carts = cartApiData.carts || [];
  const total = cartApiData.total || 0;
  const finalTotal = cartApiData.finalTotal || 0;

  // 你原本用 shoopingCartDOM.innerHTML 塞 tr，所以空車也用 tr
  if (carts.length === 0) {
    shoopingCartDOM.innerHTML = `
      <tr>
        <td colspan="5">購物車內無任何商品，您可以點選上方商品加入購物車！</td>
      </tr>
    `;
    // ✅ 如果你真的要變紅色，請用你既有 CSS class 去做，不要 inline style
    // 例如：shoopingCartDOM.classList.add('text-danger')
    return;
  }

  const cartRows = carts.map((item) => {
    const product = item.product;
    const qty = item.quantity;

    return `
      <tr>
        <td>
          <div class="cardItem-title">
            <img src="${product.images}" alt="">
            <p>${product.title}</p>
          </div>
        </td>
        <td>NT$${product.price}</td>
        <td>${qty}</td>
        <td>NT$${product.price * qty}</td>
        <td class="discardBtn">
          <a href="#" class="material-icons" data-id="${item.id}">
            clear
          </a>
        </td>
      </tr>
    `;
  }).join('');

  const totalRow = `
    <tr>
      <td>
        <a href="#" class="discardAllBtn">刪除所有品項</a>
      </td>
      <td></td>
      <td></td>
      <td>
        <p>總金額</p>
      </td>
      <td>NT$${finalTotal}</td>
    </tr>
  `;

  shoopingCartDOM.innerHTML = cartRows + totalRow;
}

init();


productFilterDOM.addEventListener('change', (e) => {
    const productValue = e.target.value;
    const filtered = productValue === "全部" ? products : products.filter((product) => product.category === productValue);
    renderList(filtered);
});

productListElDOM.addEventListener('click', async (e)=>{
    const btn = e.target.closest('.addCardBtn');
    if (!btn) return; 
    e.preventDefault();
    const productId = btn.dataset.id;

     try {
    const res = await axios.post(`${BASE_URL}/customer/${API_PATH}/carts`, {
    data: {
        productId,
        quantity: 1
      }
    });

    cartData = await fetchCart();
    renderCart(cartData);
  } catch (err) {
    console.error('加入購物車失敗', err);
  }
});

