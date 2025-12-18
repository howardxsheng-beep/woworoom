const BASE_URL = 'https://livejs-api.hexschool.io/api/livejs/v1';
const API_PATH = 'ho';



let cartData = {};
let products = [];
const productListDOM = document.querySelector('.productWrap');
const productFilterDOM = document.querySelector('.productSelect');
const productListElDOM = document.querySelector('.productWrap');
const shoopingCartDOM = document.querySelector('.shoppingCart-table');
const orderFormDOM = document.querySelector('.orderInfo-form');


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

  const carts = cartApiData.carts || [];
  const finalTotal = cartApiData.finalTotal || 0;


  if (carts.length === 0) {
    shoopingCartDOM.innerHTML = `
      <tr>
        <td colspan="5">購物車內無任何商品，您可以點選上方商品加入購物車！</td>
      </tr>
    `;
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
        <td>${item.quantity}</td>
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
  const carTableHeaders=`<tr>
                    <th width="40%">品項</th>
                    <th width="15%">單價</th>
                    <th width="15%">數量</th>
                    <th width="15%">金額</th>
                    <th width="15%"></th>
                </tr>`

  shoopingCartDOM.innerHTML = carTableHeaders + cartRows + totalRow;
}

function getQuantity(productId) {
  const item = (cartData.carts || []).find(c => c.product.id === productId);
  return (item?.quantity || 0) + 1;
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
        quantity: getQuantity(productId),
      }
    });

    cartData = await fetchCart();
    renderCart(cartData);
  } catch (err) {
    console.error('加入購物車失敗', err);
  }
});

shoopingCartDOM.addEventListener('click', async (e) => {

  const allBtn = e.target.closest('.discardAllBtn');
  if (allBtn) {
    e.preventDefault();
    try {
      await axios.delete(`${BASE_URL}/customer/${API_PATH}/carts`);
      cartData = await fetchCart();
      renderCart(cartData);
    } catch (err) {
      console.error('刪除所有購物車品項失敗', err.response?.data || err);
    }
    return;
  }


  const delBtn = e.target.closest('.material-icons');
  if (!delBtn) return;
  e.preventDefault();

  const cartId = delBtn.dataset.id;
  if (!cartId) return;

  try {
    await axios.delete(`${BASE_URL}/customer/${API_PATH}/carts/${cartId}`);
    cartData = await fetchCart();
    renderCart(cartData);
  } catch (err) {
    console.error('刪除單一品項失敗', err.response?.data || err);
  }
});






const fieldIds = ['customerName', 'customerPhone', 'customerEmail', 'customerAddress'];

function validateOrderForm() {
  let isValid = true;

  fieldIds.forEach((id) => {
    const input = document.querySelector(`#${id}`);
    if (!input) return; 

    const wrap = input.closest('.orderInfo-inputWrap'); 
    const msg = wrap?.querySelector('.orderInfo-message'); 
    if (!msg) return; 

    const value = input.value.trim();
    if (!value) {
      msg.style.display = 'block';  
      input.classList.add('is-invalid')
      
      isValid = false;
    } else {
      msg.style.display = 'none';
      input.style.border = '1px solid #CED4DA'
      input.classList.remove('is-invalid')
    }
  });

  return isValid;
}

orderFormDOM.addEventListener('submit', async (e) => {
  e.preventDefault();


  const Valid = validateOrderForm();
  if (!Valid) return;


  const name = document.querySelector('#customerName').value.trim();
  const tel = document.querySelector('#customerPhone').value.trim();
  const email = document.querySelector('#customerEmail').value.trim();
  const address = document.querySelector('#customerAddress').value.trim();
  const payment = document.querySelector('#tradeWay').value;


  try {
    const res = await axios.post(`${BASE_URL}/customer/${API_PATH}/orders`, {
      data: {
        user: { name, tel, email, address, payment }
      }
    });

    console.log('訂單建立成功：', res.data);


    cartData = await fetchCart();
    renderCart(cartData);


    orderFormDOM.reset();
  } catch (err) {
    console.error('送出訂單失敗', err);
  }
});