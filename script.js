// Shop Key Security Password
const ADMIN_PASSWORD = "milkboy";
const WHATSAPP_NUMBER = "923024337352"; // Aap ki shop ka contact number

// Initial Default Fresh Inventory Items
const defaultProducts = [
    { id: 1, name: "Khulisa Doodh (Pure Milk)", price: 220, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { id: 2, name: "Meetha Dahi (Fresh Yogurt)", price: 260, img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400" },
    { id: 3, name: "Desi Makhan (Butter)", price: 1400, img: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400" }
];

// Load core state lists from LocalStorage
let shopProducts = JSON.parse(localStorage.getItem("dairy_products")) || defaultProducts;
let liveOrders = JSON.parse(localStorage.getItem("dairy_orders")) || [];
let cart = [];

document.addEventListener("DOMContentLoaded", () => {
    renderShopProducts();
    updateCartDisplay();
    
    document.getElementById("shopOrderForm").addEventListener("submit", submitOrderToDashboard);
});

// Render Menu Items for customers on front grid
function renderShopProducts() {
    const container = document.getElementById("productsContainer");
    if(!container) return;
    container.innerHTML = "";
    
    shopProducts.forEach(prod => {
        container.innerHTML += `
            <div class="product-card">
                <div class="product-img-box">
                    <img src="${prod.img}" alt="${prod.name}">
                </div>
                <h3>${prod.name}</h3>
                <p class="product-price">Rs. ${prod.price} / unit</p>
                <button class="btn-add-cart" onclick="addToCart(${prod.id})"><i class="fas fa-cart-plus"></i> Add To Cart</button>
            </div>
        `;
    });
}

// Shopping Cart Core Logic
function addToCart(id) {
    const item = shopProducts.find(p => p.id === id);
    const existing = cart.find(c => c.id === id);
    
    if(existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCartDisplay();
}

function updateCartDisplay() {
    document.getElementById("cart-count").innerText = cart.reduce((acc, obj) => acc + obj.qty, 0);
    const container = document.getElementById("cartItemsList");
    const checkoutBox = document.getElementById("checkoutFormContainer");
    
    if(cart.length === 0) {
        container.innerHTML = `<p style="color:#64748b; text-align:center; padding:2rem;">Your cart is empty. Add some fresh dairy items!</p>`;
        checkoutBox.style.display = "none";
        return;
    }
    
    checkoutBox.style.display = "block";
    container.innerHTML = "";
    let totalBill = 0;
    
    cart.forEach((item, index) => {
        let itemTotal = item.price * item.qty;
        totalBill += itemTotal;
        
        container.innerHTML += `
            <div class="cart-item-row">
                <div>
                    <h4 style="color:#1e293b;">${item.name}</h4>
                    <small style="color:#64748b;">Rs. ${item.price} &times; ${item.qty}</small>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <b style="color:#1e293b;">Rs. ${itemTotal}</b>
                    <button class="btn-delete-small" onclick="removeFromCart(${index})">&times;</button>
                </div>
            </div>
        `;
    });
    
    document.getElementById("totalBillAmount").innerText = totalBill;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// Order Method A: Submit directly to Admin Dashboard
function submitOrderToDashboard(e) {
    e.preventDefault();
    
    const newOrder = {
        id: "RMD-" + Math.floor(1000 + Math.random() * 9000),
        name: document.getElementById("custName").value.trim(),
        phone: document.getElementById("custPhone").value.trim(),
        address: document.getElementById("custAddress").value.trim(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
        time: new Date().toLocaleString()
    };
    
    liveOrders.unshift(newOrder);
    localStorage.setItem("dairy_orders", JSON.stringify(liveOrders));
    
    alert(`🎉 Shukriya! Aap ka Order (${newOrder.id}) jamma ho gaya hai aur Shop Operator ko bhej diya gaya hai.`);
    cart = [];
    document.getElementById("shopOrderForm").reset();
    updateCartDisplay();
}

// Order Method B: Professional WhatsApp Formatting Engine
function sendOrderToWhatsApp() {
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const address = document.getElementById("custAddress").value.trim();
    
    if(!name || !phone || !address) {
        alert("Please complete checkout fields before sending to WhatsApp!");
        return;
    }
    
    let totalBill = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Construct clean elegant professional message invoice
    let msg = `*🥛 NEW ORDER RECEIVED - REHMAN DAIRY* %0A`;
    msg += `---------------------------------------%0A`;
    msg += `*👤 Customer Name:* ${name}%0A`;
    msg += `*📞 Phone Number:* ${phone}%0A`;
    msg += `*📍 Home Address:* ${address}%0A`;
    msg += `---------------------------------------%0A`;
    msg += `*🛒 Order Items Detail:*%0A`;
    
    cart.forEach(item => {
        msg += `• ${item.name} [Qty: ${item.qty}] -> Rs. ${item.price * item.qty}%0A`;
    });
    
    msg += `---------------------------------------%0A`;
    msg += `*💰 TOTAL PAYABLE BILL:* Rs. ${totalBill}/-%0A%0A`;
    msg += `_Kindly confirm my order and send delivery estimate._`;
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
}

// Security Overlay Controllers
function openAdminModal() { document.getElementById("admin-modal").style.display = "flex"; }
function closeAdminModal() { document.getElementById("admin-modal").style.display = "none"; document.getElementById("modal-error").style.display="none"; }

function verifyAdminKey() {
    const pass = document.getElementById("modalPassword").value;
    if(pass === ADMIN_PASSWORD) {
        closeAdminModal();
        document.getElementById("adminPassword").value = "";
        document.getElementById("admin-dashboard-panel").style.display = "block";
        renderAdminOrdersList();
        renderAdminInventoryControl();
    } else {
        document.getElementById("modal-error").style.display = "block";
    }
}

function closeAdminPanel() { document.getElementById("admin-dashboard-panel").style.display = "none"; }

// Admin Actions: Live Render Panel Modules
function renderAdminOrdersList() {
    const container = document.getElementById("adminOrdersListContainer");
    if(!container) return;
    container.innerHTML = "";
    
    if(liveOrders.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#64748b; padding:1rem;">No orders registered inside database yet.</p>`;
        return;
    }
    
    liveOrders.forEach(ord => {
        let itemsSummary = ord.items.map(i => `${i.name} (x${i.qty})`).join(", ");
        container.innerHTML += `
            <div class="order-ticket">
                <strong>🧾 Order ID: ${ord.id}</strong><br>
                <small style="color:#64748b;">${ord.time}</small><br><br>
                <b>Customer:</b> ${ord.name} (${ord.phone})<br>
                <b>Address:</b> ${ord.address}<br>
                <b>Items Ordered:</b> <span style="color:#0284c7; font-weight:600;">${itemsSummary}</span><br>
                <div style="margin-top:8px; font-weight:bold; color:#166534;">Total Income: Rs. ${ord.total}/-</div>
            </div>
        `;
    });
}

function clearAllOrders() {
    if(confirm("Are you sure you want to delete all incoming customer orders history?")) {
        liveOrders = [];
        localStorage.setItem("dairy_orders", JSON.stringify(liveOrders));
        renderAdminOrdersList();
    }
}

function renderAdminInventoryControl() {
    const container = document.getElementById("adminProductsDeleteContainer");
    if(!container) return;
    container.innerHTML = "";
    
    shopProducts.forEach((prod, idx) => {
        container.innerHTML += `
            <div class="admin-list-item">
                <span>📦 ${prod.name} (Rs. ${prod.price})</span>
                <button class="btn-delete-small" onclick="removeProductFromShop(${idx})">Remove</button>
            </div>
        `;
    });
}

function addNewProduct() {
    const nameInp = document.getElementById("newProdName");
    const priceInp = document.getElementById("newProdPrice");
    const fileInp = document.getElementById("newProdImage");
    
    const name = nameInp.value.trim();
    const price = parseInt(priceInp.value);
    const file = fileInp.files[0];
    
    if(!name || !price) { alert("Please input valid Product Name and Price!"); return; }
    
    if(file) {
        const reader = new FileReader();
        reader.onloadend = function() {
            saveProductToArray(name, price, reader.result);
        }
        reader.readAsDataURL(file);
    } else {
        // Fallback default image placeholder if admin does not upload local storage picture
        saveProductToArray(name, price, "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400");
    }
    
    // reset inputs
    nameInp.value = ""; priceInp.value = ""; fileInp.value = "";
}

function saveProductToArray(name, price, imageSource) {
    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        img: imageSource
    };
    shopProducts.push(newProduct);
    localStorage.setItem("dairy_products", JSON.stringify(shopProducts));
    renderShopProducts();
    renderAdminInventoryControl();
    alert(`"${name}" successfully added to main display store!`);
}

function removeProductFromShop(index) {
    if(confirm(`Remove "${shopProducts[index].name}" from your shop list?`)) {
        shopProducts.splice(index, 1);
        localStorage.setItem("dairy_products", JSON.stringify(shopProducts));
        renderShopProducts();
        renderAdminInventoryControl();
    }
}
