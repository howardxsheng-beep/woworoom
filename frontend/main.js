let products = [];
const productListDOM = document.querySelector('.productWrap')
const productFilterDOM = document.querySelector('.productSelect')


async function init(){
    const response = await axios.get('https://livejs-api.hexschool.io/api/livejs/v1/customer/ho/products')
    try{
        console.log(response.data.products);
        products = response.data.products;
        renderList(products);
    }catch(error){
        console.error(error)
    }
}

function renderList(dataToRender){
    const listHTML = dataToRender.map((product) =>{
        return`
        <li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${product.images}" alt="">
                <a href="#" class="addCardBtn">加入購物車</a>
                <h3>${product.title}</h3>
                <del class="originPrice">NT$${product.origin_price}</del>
                <p class="nowPrice">NT$${product.price}</p>
            </li>
        `
    }).join("");
    productListDOM.innerHTML = listHTML;
}



init();


productFilterDOM.addEventListener('change',(e)=>{
    const productValue = e.target.value;
    const filtered = productValue === "全部" ? products : products.filter((product)=> product.category === productValue)
    renderList(filtered)
})