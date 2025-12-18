const BASE_URL = 'https://livejs-api.hexschool.io/api/livejs/v1';
const API_PATH = 'ho';
const ADMIN_TOKEN = '98X6tvEMbQSon1wN2Z2Y9Wqf8iF3';
let chart = null;

const orderTableDOM = document.querySelector('.orderPage-table');
const discardAllBtnDOM = document.querySelector('.discardAllBtn');




async function fetchOrders(){
    const res = await axios.get(`${BASE_URL}/admin/${API_PATH}/orders`, {
    headers: { Authorization: ADMIN_TOKEN }});
    const orders = res.data.orders;
    return orders
};

async function init() {
    try {
        orders = await fetchOrders();
        console.log(orders);
        renderOrders(orders);
        renderChartByProduct(orders); 
      

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
        <th style="width: 10%;">訂單狀態</th>
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
            .map(product => `<p>${product.title || ''} x ${product.quantity ?? 1}</p>`)
            .join('')}
        </td>
        <td>${new Date(order.createdAt * 1000).toLocaleDateString()}</td>
        <td class="orderStatus"><a href="#" data-id="${order.id}">${order.paid ? "已付款" : "未處理"}  </a></td>
        <td>
          <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${order.id}">
        </td>
      </tr>
    `;
  }).join("");

  orderTableDOM.innerHTML = headerHTML + `<tbody>${ordersHTML}</tbody>`;
};



function getProductCount(orders) {
  if (!orders || orders.length === 0) return {};

  return orders.reduce((productObj, order) => {
    if (!order.products || order.products.length === 0) return productObj;

    order.products.forEach((product) => {
      const title = product.title;
      const price = Number(product.price) || 0;
      const qty = Number(product.quantity) || 0;
      const total = price * qty; 
      productObj[title] = (productObj[title] || 0) + total;
    });

    return productObj;
  }, {});
}

function toC3Columns(count) {
  const columns = Object.entries(count).map(([title, count]) => [title, count]);
  return columns.sort((a, b) => b[1] - a[1]); 
}

function initChart() {
  chart = c3.generate({
    bindto: '#chart',
    data: {
      type: 'pie',
      columns: [['無資料', 1]],
      colors: {
        '無資料': '#301E5F'
      }
    }
  });
}


function renderChartByProduct(orders) {
  if (!chart) initChart();

  const countProduct = getProductCount(orders);
  const columns = toC3Columns(countProduct);

  chart.load({
    columns: columns.length ? columns : [['無資料', 1]],
    unload: true, 
  });
}

async function updateOrderPaid(orderId,paidStatus){
 const response = await axios.put(`${BASE_URL}/admin/${API_PATH}/orders/`,{
    data:{
      id:orderId,
      paid:paidStatus
    }
  },{
    headers: { Authorization: ADMIN_TOKEN } 
  });
  return response.data.orders
};

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
    renderChartByProduct(orders);
  } catch (err) {
    console.error('刪除訂單失敗', err.response?.data || err);
  }
});





discardAllBtnDOM.addEventListener('click', async (e) => {
  e.preventDefault();
  const isConfirmed = window.confirm('確定要清除全部訂單嗎？此操作無法復原。');
  if (!isConfirmed) return;

  try {
    const res = await axios.delete(
      `${BASE_URL}/admin/${API_PATH}/orders`,
      { headers: { Authorization: ADMIN_TOKEN } }
    );


    console.log('刪除全部訂單成功');
    renderOrders(res.data.orders); 
    initChart();
  } catch (err) {
    console.error('清除全部訂單失敗', err.response?.data || err);
  }
});


orderTableDOM.addEventListener('click', async (e) => {
  const statusBtn = e.target.closest('.orderStatus a');
  if (!statusBtn) return;

  e.preventDefault();

  const orderId = statusBtn.dataset.id;
  if (!orderId) return;


  const isPaidNow = statusBtn.textContent.trim() === '已付款';
  const nextPaid = !isPaidNow;

  try {
    const orders = await updateOrderPaid(orderId, nextPaid);
    renderOrders(orders);

  } catch (err) {
    console.error('更新訂單狀態失敗', err.response?.data || err);
    const failToPut = window.alert("更新訂單狀態失敗");
  }
});