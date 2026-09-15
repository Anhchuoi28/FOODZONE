document.addEventListener('DOMContentLoaded', () => {
    // Biến lưu trữ danh sách sản phẩm từ CSDL
    let allProducts = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // DOM Elements
    const productsGrid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const cartCount = document.getElementById('cartCount');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartBtn = document.getElementById('cartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartItemsList = document.getElementById('cartItemsList');
    const emptyCart = document.getElementById('emptyCart');
    const cartFooter = document.getElementById('cartFooter');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckoutModal = document.getElementById('closeCheckoutModal');
    const checkoutForm = document.getElementById('checkoutForm');
    const modalSummaryItems = document.getElementById('modalSummaryItems');
    const modalTotalAmount = document.getElementById('modalTotalAmount');
    const successModal = document.getElementById('successModal');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    const orderIdText = document.getElementById('orderIdText');
    const toastContainer = document.getElementById('toastContainer');
    
    // Mobile Nav Elements
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const closeMobileNav = document.getElementById('closeMobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');

    // 1. TẢI DỮ LIỆU SẢN PHẨM TỪ CSDL QUA API
    async function fetchProducts() {
        try {
            const response = await fetch('http://localhost:3000/api/products');
            if (!response.ok) throw new Error('Không thể lấy dữ liệu sản phẩm');
            allProducts = await response.json();
            displayProducts(allProducts);
        } catch (error) {
            console.error('Lỗi khi tải sản phẩm:', error);
            showToast('Không thể kết nối đến cơ sở dữ liệu!', 'error');
        }
    }

    // 2. HIỂN THỊ DANH SÁCH SẢN PHẨM RA MÀN HÌNH
    function displayProducts(products) {
        productsGrid.innerHTML = '';
        if (products.length === 0) {
            noResults.style.display = 'flex';
            return;
        }
        noResults.style.display = 'none';

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            // Xử lý hiển thị badge nếu có
            let badgeHTML = '';
            if (product.badge) {
                badgeHTML = `<span class="product-badge ${product.badgeClass || ''}">${product.badge}</span>`;
            }

            productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.img}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'">
                    ${badgeHTML}
                    <div class="product-rating">
                        <i class="fa-solid fa-star"></i> ${product.rating || '4.9'}
                    </div>
                </div>
                <div class="product-content">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-desc">${product.description || 'Món ăn ngon chuẩn vị sinh viên.'}</p>
                    <div class="product-footer">
                        <span class="product-price">${Number(product.price).toLocaleString('vi-VN')}đ</span>
                        <button class="add-to-cart-btn" data-id="${product.id}" aria-label="Thêm vào giỏ">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });

        // Gắn sự kiện click cho các nút "Thêm vào giỏ" mới tạo
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const product = allProducts.find(p => p.id == id);
                if (product) addToCart(product);
            });
        });
    }

    // 3. XỬ LÝ GIỎ HÀNG (Thêm, Xóa, Cập nhật số lượng)
    function addToCart(product) {
        const existingItem = cart.find(item => item.id == product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCart();
        showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
    }

    function updateCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Cập nhật số lượng badge trên icon giỏ hàng
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalCount;

        if (cart.length === 0) {
            emptyCart.style.display = 'flex';
            cartItemsList.innerHTML = '';
            cartFooter.style.display = 'none';
            return;
        }

        emptyCart.style.display = 'none';
        cartFooter.style.display = 'block';

        cartItemsList.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            const cartItemEl = document.createElement('div');
            cartItemEl.className = 'cart-item';
            cartItemEl.innerHTML = `
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">${Number(item.price).toLocaleString('vi-VN')}đ</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn decrease-qty" data-id="${item.id}">-</button>
                        <span class="qty-num">${item.quantity}</span>
                        <button class="qty-btn increase-qty" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-item-btn" data-id="${item.id}"><i class="fa-solid fa-trash-can"></i></button>
            `;
            cartItemsList.appendChild(cartItemEl);
        });

        cartSubtotal.textContent = Number(subtotal).toLocaleString('vi-VN') + 'đ';
        cartTotal.textContent = Number(subtotal).toLocaleString('vi-VN') + 'đ';

        // Gắn sự kiện tăng/giảm/xóa trong giỏ hàng
        document.querySelectorAll('.increase-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const item = cart.find(i => i.id == id);
                if (item) { item.quantity++; updateCart(); }
            });
        });

        document.querySelectorAll('.decrease-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const item = cart.find(i => i.id == id);
                if (item && item.quantity > 1) {
                    item.quantity--;
                } else {
                    cart = cart.filter(i => i.id != id);
                }
                updateCart();
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                cart = cart.filter(i => i.id != id);
                updateCart();
            });
        });
    }

    // Xử lý nút đặt combo có sẵn trên giao diện HTML
    document.querySelectorAll('.add-combo-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const dataset = e.currentTarget.dataset;
            const comboProduct = {
                id: dataset.id,
                name: dataset.name,
                price: Number(dataset.price),
                img: dataset.img,
                description: 'Combo tiết kiệm'
            };
            addToCart(comboProduct);
        });
    });

    // 4. TÌM KIẾM VÀ LỌC SẢN PHẨM
    function filterProducts() {
        const keyword = (searchInput.value || mobileSearchInput.value || '').toLowerCase().trim();
        const activeCategory = document.querySelector('.category-tab.active').getAttribute('data-category');

        const filtered = allProducts.filter(product => {
            const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
            const matchesKeyword = product.name.toLowerCase().includes(keyword);
            return matchesCategory && matchesKeyword;
        });

        displayProducts(filtered);
    }

    searchInput?.addEventListener('input', filterProducts);
    mobileSearchInput?.addEventListener('input', filterProducts);

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterProducts();
        });
    });

    // 5. THANH TOÁN & GỬI ĐƠN HÀNG LÊN CSDL
    checkoutBtn?.addEventListener('click', () => {
        if (cart.length === 0) return;
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('show');
        
        // Đổ dữ liệu vào bảng tóm tắt đơn hàng trong Modal thanh toán
        modalSummaryItems.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            const row = document.createElement('div');
            row.className = 'summary-item-row';
            row.innerHTML = `<span class="item-name">${item.name} (x${item.quantity})</span> <span>${(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>`;
            modalSummaryItems.appendChild(row);
        });
        modalTotalAmount.textContent = Number(total).toLocaleString('vi-VN') + 'đ';
        checkoutModal.classList.add('show');
    });

    checkoutForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const orderData = {
            studentName: document.getElementById('studentName').value,
            studentPhone: document.getElementById('studentPhone').value,
            deliveryArea: document.getElementById('deliveryArea').value,
            detailedAddress: document.getElementById('detailedAddress').value,
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
            notes: document.getElementById('orderNotes').value,
            items: cart,
            totalAmount: totalAmount
        };

        try {
            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            if (response.ok) {
                checkoutModal.classList.remove('show');
                orderIdText.textContent = `SVC-${result.orderId}`;
                successModal.classList.add('show');
                cart = [];
                updateCart();
                checkoutForm.reset();
            } else {
                alert(result.message || 'Có lỗi xảy ra khi đặt hàng.');
            }
        } catch (error) {
            console.error('Lỗi khi gửi đơn hàng:', error);
            alert('Không thể kết nối đến server để đặt hàng!');
        }
    });

    // 6. UI TOGGLES (Mở/Đóng giỏ hàng, Menu di động, Modal)
    cartBtn?.addEventListener('click', () => { cartDrawer.classList.add('open'); cartOverlay.classList.add('show'); });
    closeCartBtn?.addEventListener('click', () => { cartDrawer.classList.remove('open'); cartOverlay.classList.remove('show'); });
    cartOverlay?.addEventListener('click', () => {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('show');
        mobileNav.classList.remove('open');
        mobileNavOverlay.classList.remove('show');
    });

    menuToggle?.addEventListener('click', () => { mobileNav.classList.add('open'); mobileNavOverlay.classList.add('show'); });
    closeMobileNav?.addEventListener('click', () => { mobileNav.classList.remove('open'); mobileNavOverlay.classList.remove('show'); });
    
    closeCheckoutModal?.addEventListener('click', () => checkoutModal.classList.remove('show'));
    closeSuccessBtn?.addEventListener('click', () => successModal.classList.remove('show'));

    // Toast Notification Helper
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
        toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> <span>${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    // Khởi chạy khi vào trang
    fetchProducts();
    updateCart();
});