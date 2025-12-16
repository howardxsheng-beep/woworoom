const BASE_URL = 'https://livejs-api.hexschool.io/api/livejs/v1';
const API_PATH = 'ho';
const ADMIN_TOKEN = '98X6tvEMbQSon1wN2Z2Y9Wqf8iF3';

const orderTableDOM = document.querySelector('.orderPage-table');
const discardAllBtnDOM = document.querySelector('.discardAllBtn');

// C3.js
let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: [
        ['Louvre 雙人床架', 1],
        ['Antony 雙人床架', 2],
        ['Anty 雙人床架', 3],
        ['其他', 4],
        ],
        colors:{
            "Louvre 雙人床架":"#DACBFF",
            "Antony 雙人床架":"#9D7FEA",
            "Anty 雙人床架": "#5434A7",
            "其他": "#301E5F",
        }
    },
});


async function fetchOrders(){
    const res = await axios.get(`${BASE_URL}/admin/${API_PATH}/orders`, {
    headers: { Authorization: ADMIN_TOKEN }});
    const orders = res.data.orders;
    return orders
};

async function init() {
    try {
        orders = await fetchOrders();
        console.log(orders)
        renderOrders(orders)
      

    } catch (error) {
        console.error("失敗：", error);
    }
};


function renderOrders(dataToRender) {
  const headerHTML = `
    <thead>
      <tr>
        <th>訂單編號</th>
        <th>聯絡人</th>
        <th>聯絡地址</th>
        <th>電子郵件</th>
        <th>訂單品項</th>
        <th>訂單日期</th>
        <th>訂單狀態</th>
        <th>操作</th>
      </tr>
    </thead>
  `;


  if (!dataToRender || dataToRender.length === 0) {
    orderTableDOM.innerHTML = headerHTML + `
      <tbody>
        <tr>
          <td colspan="8">目前沒有訂單</td>
        </tr>
      </tbody>
    `;
    return;
  }

  const ordersHTML = dataToRender.map((order) => {
    return `
      <tr>
        <td>${order.id}</td>
        <td>
          <p>${order.user.name}</p>
          <p>${order.user.tel}</p>
        </td>
        <td>${order.user.address}</td>
        <td>${order.user.email}</td>
        <td>
          ${(order.products)
            .map(p => `<p>${p.title || ''} x ${p.quantity ?? 1}</p>`)
            .join(' ')}
        </td>
        <td>${new Date(order.updatedAt * 1000).toLocaleDateString()}</td>
        <td class="orderStatus"><a href="#">未處理</a></td>
        <td>
          <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${order.id}">
        </td>
      </tr>
    `;
  }).join("");

  orderTableDOM.innerHTML = headerHTML + `<tbody>${ordersHTML}</tbody>`;
};

function renderProductListHTML(products = []) {
  return products
    .map(p => `<p>${p.title || ''} x ${p.quantity ?? 1}</p>`)
    .join('');
}


init();


orderTableDOM.addEventListener('click', async (e) => {
  const btn = e.target.closest('.delSingleOrder-Btn');
  if (!btn) return;

  const orderId = btn.dataset.id;
  if (!orderId) return;

  try {
    const res = await axios.delete(
      `${BASE_URL}/admin/${API_PATH}/orders/${orderId}`,
      { headers: { Authorization: ADMIN_TOKEN } }
    );
    const orders = res.data.orders;  
    renderOrders(orders);
  } catch (err) {
    console.error('刪除訂單失敗', err.response?.data || err);
  }
});





discardAllBtnDOM.addEventListener('click', async (e) => {
  e.preventDefault();

  try {
    const res = await axios.delete(
      `${BASE_URL}/admin/${API_PATH}/orders`,
      { headers: { Authorization: ADMIN_TOKEN } }
    );

    console.log('刪除全部訂單成功');
    renderOrders(res.data.orders); 
  } catch (err) {
    console.error('清除全部訂單失敗', err.response?.data || err);
  }
});

