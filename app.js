let currentMode = null;
let activeCategoryIndex = null;
let activeCompanyIndex = null;
let isPriceVisible = true;
let isFactureMode = false;
let factureItems = [];
let factureModalInstance = null;

const defaultData = [
    {
        title: "الحساسات (Capteurs)",
        image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=500&q=80",
        products: [
            { ref: "ZN101630", name: "LANCEUR R9 D-R11 D-UNO D", info: "Original FAE", price: 93.80, available: true, image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=300&q=80" },
            { ref: "79347_F", name: "CAPTEUR D IMPULSION FIAT BRAVO II - DOBLO", info: "Original FAE", price: 169.98, available: true, image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=300&q=80" }
        ]
    }
];

const defaultCompanies = [
    {
        title: "Samsung",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=500&q=80",
        invoices: [
            { id: "FAC-001", title: "فاتورة سلع شهر أكتوبر", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80" }
        ]
    }
];

let data = JSON.parse(localStorage.getItem('auto_parts_data')) || defaultData;
let companies = JSON.parse(localStorage.getItem('auto_parts_companies')) || defaultCompanies;

function saveData() {
    localStorage.setItem('auto_parts_data', JSON.stringify(data));
    localStorage.setItem('auto_parts_companies', JSON.stringify(companies));
}

function togglePriceVisibility() {
    isPriceVisible = !isPriceVisible;
    const icon = document.getElementById('price-icon');
    icon.className = isPriceVisible ? "fa-solid fa-eye" : "fa-solid fa-eye-slash text-danger";
    if (activeCategoryIndex !== null) renderProducts();
}

function toggleFactureMode(enabled) {
    isFactureMode = enabled;
    document.getElementById('view-facture-btn').classList.toggle('d-none', !enabled);
    if (activeCategoryIndex !== null) renderProducts();
}

function enterMode(mode) {
    currentMode = mode;
    document.getElementById('welcome-section').classList.add('d-none');
    document.getElementById('app-content').classList.remove('d-none');
    document.getElementById('home-btn').classList.remove('d-none');
    document.getElementById('factures-nav-btn').classList.remove('d-none');
    document.getElementById('facture-switch-container').classList.remove('d-none');

    const badge = document.getElementById('role-badge');
    if (currentMode === 'admin') {
        badge.className = "badge bg-danger fs-6";
        badge.innerText = "وضع التعديلات (Admin)";
        document.getElementById('admin-banner').classList.remove('d-none');
        document.getElementById('admin-add-product-btn').classList.remove('d-none');
        document.getElementById('admin-add-company-btn').classList.remove('d-none');
        document.getElementById('admin-add-invoice-btn').classList.remove('d-none');
    } else {
        badge.className = "badge bg-primary fs-6";
        badge.innerText = "وضع المعلومات (Client)";
        document.getElementById('admin-banner').classList.add('d-none');
        document.getElementById('admin-add-product-btn').classList.add('d-none');
        document.getElementById('admin-add-company-btn').classList.add('d-none');
        document.getElementById('admin-add-invoice-btn').classList.add('d-none');
    }

    showSection('categories-section');
}

function showSection(sectionId) {
    if (sectionId === 'welcome-section') {
        document.getElementById('welcome-section').classList.remove('d-none');
        document.getElementById('app-content').classList.add('d-none');
        document.getElementById('home-btn').classList.add('d-none');
        document.getElementById('factures-nav-btn').classList.add('d-none');
        document.getElementById('facture-switch-container').classList.add('d-none');
        document.getElementById('view-facture-btn').classList.add('d-none');
        document.getElementById('role-badge').className = "badge bg-secondary";
        document.getElementById('role-badge').innerText = "اختر الوضع";
        return;
    }

    document.getElementById('categories-section').classList.add('d-none');
    document.getElementById('products-section').classList.add('d-none');
    document.getElementById('companies-section').classList.add('d-none');
    document.getElementById('company-invoices-section').classList.add('d-none');

    if (sectionId === 'categories-section') {
        document.getElementById('categories-section').classList.remove('d-none');
        renderCategories();
    } else if (sectionId === 'companies-section') {
        document.getElementById('companies-section').classList.remove('d-none');
        renderCompanies();
    }
}

function renderCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = '';

    data.forEach((cat, index) => {
        let deleteBtn = '';
        if (currentMode === 'admin') {
            deleteBtn = `
                <button class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 shadow-sm z-3" onclick="deleteCategory(event, ${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
        }

        container.innerHTML += `
            <div class="col-md-4 col-sm-6">
                <div class="card category-card border-0 shadow-sm h-100 position-relative" onclick="openCategory(${index})">
                    ${deleteBtn}
                    <img src="${cat.image}" class="card-img-top" alt="${cat.title}">
                    <div class="card-body text-center">
                        <h5 class="card-title fw-bold text-white m-0">${cat.title}</h5>
                        <small class="text-muted">${cat.products.length} قطعة</small>
                    </div>
                </div>
            </div>
        `;
    });
}

function openCategory(index) {
    activeCategoryIndex = index;
    document.getElementById('current-category-title').innerText = data[index].title;
    document.getElementById('categories-section').classList.add('d-none');
    document.getElementById('products-section').classList.remove('d-none');
    renderProducts();
}

function renderProducts(filteredList = null) {
    const gridContainer = document.getElementById('products-grid-container');
    gridContainer.innerHTML = '';
    
    const products = filteredList || data[activeCategoryIndex].products;
    document.getElementById('product-count').innerText = products.length;

    if (products.length === 0) {
        gridContainer.innerHTML = `<div class="col-12 text-center py-5 text-muted">لا توجد قطع متوفرة.</div>`;
        return;
    }

    products.forEach((p, pIndex) => {
        const realIndex = data[activeCategoryIndex].products.indexOf(p);
        const displayPrice = isPriceVisible ? `${parseFloat(p.price).toFixed(2)} DH` : `*** DH`;

        let adminControls = '';
        if (currentMode === 'admin') {
            adminControls = `
                <div class="border-top p-2 bg-dark d-flex justify-content-between align-items-center">
                    <button class="btn btn-warning btn-sm" onclick="editPrice(${realIndex})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn ${p.available ? 'btn-secondary' : 'btn-success'} btn-sm" onclick="toggleStock(${realIndex})">
                        ${p.available ? 'نفذت' : 'متوفرة'}
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${realIndex})"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
        }

        let factureControl = '';
        if (isFactureMode && p.available) {
            factureControl = `
                <div class="border-top p-2 bg-warning bg-opacity-10 d-flex align-items-center gap-1">
                    <input type="number" id="qty-${realIndex}" class="form-control form-control-sm text-center" value="1" min="1" style="width: 50px;">
                    <button class="btn btn-sm btn-success w-100 fw-bold" onclick="addToFacture(${realIndex})">+ للفاتورة</button>
                </div>
            `;
        }

        gridContainer.innerHTML += `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="product-card h-100 d-flex flex-column ${!p.available ? 'out-of-stock-card' : ''}" ondblclick="zoomProduct(${realIndex})">
                    <div class="d-flex justify-content-between align-items-center p-2 border-bottom bg-dark">
                        <span class="ref-badge">${p.ref || 'N/A'}</span>
                        ${!p.available ? '<span class="badge bg-danger">مبيوع</span>' : ''}
                    </div>
                    <div class="product-img-box">
                        <img src="${p.image || 'https://via.placeholder.com/150'}" alt="${p.name}">
                    </div>
                    <div class="p-2 text-center flex-grow-1 d-flex flex-column justify-content-between">
                        <div class="product-title mb-2" title="${p.name}">${p.name}</div>
                        <div class="product-price my-1">${displayPrice}</div>
                    </div>
                    ${factureControl}
                    ${adminControls}
                </div>
            </div>
        `;
    });
}

// EXTRA LARGE ZOOM
function zoomProduct(realIndex) {
    const prod = data[activeCategoryIndex].products[realIndex];
    document.getElementById('zoom-ref-badge').innerText = prod.ref || 'N/A';
    document.getElementById('zoom-title').innerText = prod.name;
    document.getElementById('zoom-img').src = prod.image || 'https://via.placeholder.com/150';
    document.getElementById('zoom-info').innerText = prod.info || '';
    document.getElementById('zoom-price').innerText = isPriceVisible ? `${parseFloat(prod.price).toFixed(2)} DH` : `*** DH`;
    
    new bootstrap.Modal(document.getElementById('zoomModal')).show();
}

/* COMPANIES & INVOICES MANAGEMENT */
function renderCompanies() {
    const container = document.getElementById('companies-container');
    container.innerHTML = '';

    companies.forEach((comp, index) => {
        let deleteBtn = '';
        if (currentMode === 'admin') {
            deleteBtn = `<button class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 z-3" onclick="deleteCompany(event, ${index})"><i class="fa-solid fa-trash"></i></button>`;
        }

        container.innerHTML += `
            <div class="col-md-4 col-sm-6">
                <div class="card category-card border-0 shadow-sm h-100 position-relative" onclick="openCompany(${index})">
                    ${deleteBtn}
                    <img src="${comp.image}" class="card-img-top" alt="${comp.title}">
                    <div class="card-body text-center">
                        <h5 class="card-title fw-bold text-info m-0">${comp.title}</h5>
                        <small class="text-muted">${comp.invoices.length} فاتورة مصورة</small>
                    </div>
                </div>
            </div>
        `;
    });
}

function openCompany(index) {
    activeCompanyIndex = index;
    document.getElementById('current-company-title').innerText = `فواتير شركة: ${companies[index].title}`;
    document.getElementById('companies-section').classList.add('d-none');
    document.getElementById('company-invoices-section').classList.remove('d-none');
    document.getElementById('invoice-search-input').value = '';
    renderInvoices();
}

function renderInvoices(filteredList = null) {
    const container = document.getElementById('invoices-vertical-container');
    container.innerHTML = '';
    const invList = filteredList || companies[activeCompanyIndex].invoices;

    document.getElementById('invoice-count').innerText = invList.length;

    if (invList.length === 0) {
        container.innerHTML = `<div class="text-center py-5 text-muted fs-5">لا توجد فواتير مصورة لهذه الشركة حالياً.</div>`;
        return;
    }

    invList.forEach((inv, index) => {
        const realIndex = companies[activeCompanyIndex].invoices.indexOf(inv);
        let deleteBtn = '';
        if (currentMode === 'admin') {
            deleteBtn = `<button class="btn btn-danger btn-sm" onclick="deleteInvoice(${realIndex})"><i class="fa-solid fa-trash me-1"></i> حذف الفاتورة</button>`;
        }

        container.innerHTML += `
            <div class="invoice-card-full p-3 id="invoice-card-${realIndex}">
                <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 border-bottom border-secondary pb-2">
                    <div>
                        <span class="badge bg-info text-dark fs-6 me-2">${inv.id || 'N/A'}</span>
                        <span class="fw-bold fs-4 text-white">${inv.title}</span>
                    </div>
                    ${deleteBtn}
                </div>
                <!-- الصورة كبيرة بالكامل وواضحة -->
                <div class="invoice-img-large-box">
                    <img src="${inv.image}" alt="${inv.title}" loading="lazy">
                </div>
            </div>
        `;
    });
}

function filterInvoices() {
    const query = document.getElementById('invoice-search-input').value.toLowerCase().trim();
    const allInvoices = companies[activeCompanyIndex].invoices;

    if (!query) return renderInvoices(allInvoices);

    const filtered = allInvoices.filter(inv => 
        (inv.id && inv.id.toLowerCase().includes(query)) || 
        (inv.title && inv.title.toLowerCase().includes(query))
    );

    renderInvoices(filtered);
}

function addCompany() {
    const title = document.getElementById('company-title').value.trim();
    const fileInput = document.getElementById('company-img-file');
    if (!title) return;

    const save = (imgSrc) => {
        companies.push({ title: title, image: imgSrc, invoices: [] });
        saveData();
        renderCompanies();
        finishModal('addCompanyModal', ['company-title', 'company-img-file']);
    };

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => save(e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        save('https://via.placeholder.com/300');
    }
}

function addInvoice() {
    const ref = document.getElementById('invoice-ref').value.trim();
    const title = document.getElementById('invoice-title').value.trim();
    const fileInput = document.getElementById('invoice-img-file');

    if (!fileInput.files || !fileInput.files[0]) {
        alert("يرجى اختيار صورة الفاتورة من الهاتف/الجهاز!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        companies[activeCompanyIndex].invoices.push({
            id: ref || `FAC-${Date.now().toString().slice(-4)}`,
            title: title || 'فاتورة بدون عنوان',
            image: e.target.result
        });
        saveData();
        renderInvoices();
        finishModal('addInvoiceModal', ['invoice-ref', 'invoice-title', 'invoice-img-file']);
    };
    reader.readAsDataURL(fileInput.files[0]);
}

function deleteCompany(e, index) {
    e.stopPropagation();
    if (confirm(`حذف ملف الشركة وفواتيرها بالكامل؟`)) {
        companies.splice(index, 1);
        saveData();
        renderCompanies();
    }
}

function deleteInvoice(index) {
    if (confirm(`حذف هذه الفاتورة المصورة؟`)) {
        companies[activeCompanyIndex].invoices.splice(index, 1);
        saveData();
        renderInvoices();
    }
}

/* FACTURE GENERATOR FUNCTIONS */
function addToFacture(realIndex) {
    const prod = data[activeCategoryIndex].products[realIndex];
    const qtyInput = document.getElementById(`qty-${realIndex}`);
    const qty = parseInt(qtyInput ? qtyInput.value : 1);

    const existingIndex = factureItems.findIndex(item => item.ref === prod.ref && item.name === prod.name);
    if (existingIndex > -1) {
        factureItems[existingIndex].qty += qty;
    } else {
        factureItems.push({
            name: prod.name,
            ref: prod.ref,
            price: parseFloat(prod.price),
            qty: qty
        });
    }

    document.getElementById('facture-count').innerText = factureItems.length;
    alert(`تمت إضافة ${qty} من ${prod.name} إلى الفاتورة`);
}

function openFactureModal() {
    const tbody = document.getElementById('facture-table-body');
    tbody.innerHTML = '';
    let grandTotal = 0;

    factureItems.forEach((item, index) => {
        const lineTotal = item.price * item.qty;
        grandTotal += lineTotal;

        tbody.innerHTML += `
            <tr>
                <td class="text-start">
                    <span class="badge bg-secondary me-1">${item.ref}</span>
                    <strong>${item.name}</strong>
                </td>
                <td>${item.price.toFixed(2)} DH</td>
                <td>${item.qty}</td>
                <td class="fw-bold">${lineTotal.toFixed(2)} DH</td>
                <td class="no-print">
                    <button class="btn btn-sm btn-outline-danger" onclick="removeFromFacture(${index})">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    document.getElementById('facture-total').innerText = `${grandTotal.toFixed(2)} DH`;

    const modalElement = document.getElementById('factureModal');
    if (!factureModalInstance) {
        factureModalInstance = new bootstrap.Modal(modalElement);
    }
    factureModalInstance.show();
}

function removeFromFacture(index) {
    factureItems.splice(index, 1);
    document.getElementById('facture-count').innerText = factureItems.length;
    openFactureModal();
}

function clearFacture() {
    factureItems = [];
    document.getElementById('facture-count').innerText = 0;
    if (factureModalInstance) {
        factureModalInstance.hide();
    }
}

/* CORE HANDLERS */
function filterProducts() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const allProducts = data[activeCategoryIndex].products;
    if (!query) return renderProducts(allProducts);

    const filtered = allProducts.filter(p => 
        (p.ref && p.ref.toLowerCase().includes(query)) || 
        (p.name && p.name.toLowerCase().includes(query))
    );
    renderProducts(filtered);
}

function addCategory() {
    const titleInput = document.getElementById('cat-title');
    const fileInput = document.getElementById('cat-img-file');
    const title = titleInput ? titleInput.value.trim() : '';

    if (!title) {
        alert("يرجى إدخال اسم الصنف!");
        return;
    }

    const saveCat = (imgSrc) => {
        data.push({ title: title, image: imgSrc, products: [] });
        saveData();
        renderCategories();
        finishModal('addCategoryModal', ['cat-title', 'cat-img-file']);
    };

    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => saveCat(e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveCat('https://via.placeholder.com/300');
    }
}

function addProduct() {
    const ref = document.getElementById('prod-ref').value.trim();
    const name = document.getElementById('prod-name').value.trim();
    const info = document.getElementById('prod-info').value.trim();
    const price = document.getElementById('prod-price').value.trim();
    const fileInput = document.getElementById('prod-img-file');

    if (!name || !price) {
        alert("يرجى إدخال اسم القطعة والثمن!");
        return;
    }

    const saveProd = (imgSrc) => {
        data[activeCategoryIndex].products.push({
            ref: ref || 'N/A',
            name: name,
            info: info,
            price: price,
            available: true,
            image: imgSrc
        });
        saveData();
        renderProducts();
        finishModal('addProductModal', ['prod-ref', 'prod-name', 'prod-info', 'prod-price', 'prod-img-file']);
    };

    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => saveProd(e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveProd('https://via.placeholder.com/150');
    }
}

function deleteCategory(e, catIndex) {
    e.stopPropagation();
    if (confirm(`حذف صنف "${data[catIndex].title}"؟`)) {
        data.splice(catIndex, 1);
        saveData();
        renderCategories();
    }
}

function deleteProduct(pIndex) {
    if (confirm(`حذف القطعة؟`)) {
        data[activeCategoryIndex].products.splice(pIndex, 1);
        saveData();
        renderProducts();
    }
}

function toggleStock(pIndex) {
    data[activeCategoryIndex].products[pIndex].available = !data[activeCategoryIndex].products[pIndex].available;
    saveData();
    renderProducts();
}

function editPrice(pIndex) {
    const newPrice = prompt("الثمن الجديد (درهم):", data[activeCategoryIndex].products[pIndex].price);
    if (newPrice !== null && newPrice !== "") {
        data[activeCategoryIndex].products[pIndex].price = newPrice;
        saveData();
        renderProducts();
    }
}

function finishModal(modalId, inputIds) {
    const modalElement = document.getElementById(modalId);
    let modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (!modalInstance) {
        modalInstance = new bootstrap.Modal(modalElement);
    }
    modalInstance.hide();

    inputIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });
}