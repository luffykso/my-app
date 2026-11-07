let currentMode = null;
let activeCategoryIndex = null;
let activeSubCategoryIndex = null;
let activeCompanyIndex = null;
let isPriceVisible = true;

const defaultData = [
    {
        title: "الرولمات (Roulements)",
        image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=500&q=80",
        subCategories: [
            {
                title: "صنف أ (Roulements Avant)",
                products: [
                    { ref: "ZN101630", name: "LANCEUR R9 D-R11 D-UNO D", price: 93.80, available: true, image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=500&q=80" },
                    { ref: "79347_F", name: "ROULEMENT GOLF 7", price: 169.98, available: true, image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=500&q=80" }
                ]
            },
            {
                title: "صنف ب (Roulements Arrière)",
                products: [
                    { ref: "RL-8801", name: "ROULEMENT PEUGEOT 208", price: 280.00, available: true, image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=500&q=80" }
                ]
            }
        ]
    }
];

const defaultCompanies = [
    {
        title: "Samsung",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=500&q=80",
        invoices: [
            { id: "FAC-001", title: "فاتورة شهر أكتوبر", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80" }
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
    document.getElementById('price-icon').className = isPriceVisible ? "fa-solid fa-eye" : "fa-solid fa-eye-slash text-danger";
    if (activeCategoryIndex !== null) renderSubCategories();
}

function enterMode(mode) {
    currentMode = mode;
    document.getElementById('welcome-section').classList.add('d-none');
    document.getElementById('app-content').classList.remove('d-none');
    document.getElementById('home-btn').classList.remove('d-none');
    document.getElementById('factures-nav-btn').classList.remove('d-none');

    const badge = document.getElementById('role-badge');
    if (currentMode === 'admin') {
        badge.className = "badge bg-danger fs-6";
        badge.innerText = "وضع التعديلات (Admin)";
        document.getElementById('admin-banner').classList.remove('d-none');
        document.getElementById('admin-add-subcat-btn').classList.remove('d-none');
        document.getElementById('admin-add-company-btn').classList.remove('d-none');
        document.getElementById('admin-add-invoice-btn').classList.remove('d-none');
    } else {
        badge.className = "badge bg-primary fs-6";
        badge.innerText = "وضع المعلومات (Client)";
        document.getElementById('admin-banner').classList.add('d-none');
        document.getElementById('admin-add-subcat-btn').classList.add('d-none');
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
            deleteBtn = `<button class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 z-3" onclick="deleteCategory(event, ${index})"><i class="fa-solid fa-trash"></i></button>`;
        }

        container.innerHTML += `
            <div class="col-md-4 col-sm-6">
                <div class="card category-card border-0 shadow-sm h-100 position-relative" onclick="openCategory(${index})">
                    ${deleteBtn}
                    <img src="${cat.image || 'https://via.placeholder.com/300'}" class="card-img-top" alt="${cat.title || ''}">
                    <div class="card-body text-center">
                        <h5 class="card-title fw-bold text-white m-0">${cat.title || 'بدون عنوان'}</h5>
                        <small class="text-muted">${cat.subCategories ? cat.subCategories.length : 0} أصناف فرعية</small>
                    </div>
                </div>
            </div>
        `;
    });
}

function openCategory(index) {
    activeCategoryIndex = index;
    document.getElementById('current-category-title').innerText = data[index].title || 'القطع';
    document.getElementById('categories-section').classList.add('d-none');
    document.getElementById('products-section').classList.remove('d-none');
    renderSubCategories();
}
function renderSubCategories(filteredQuery = null) {
    const container = document.getElementById('subcategories-container');
    container.innerHTML = '';
    const subCats = data[activeCategoryIndex].subCategories || [];

    if (subCats.length === 0) {
        container.innerHTML = `<div class="text-center py-5 text-muted fs-5">لا توجد أصناف فرعية حالياً.</div>`;
        return;
    }

    subCats.forEach((subCat, sIndex) => {
        let products = subCat.products || [];

        // 1. فلترة البحث إذا كانت كاينا
        if (filteredQuery) {
            products = products.filter(p => 
                (p.ref && p.ref.toLowerCase().includes(filteredQuery)) || 
                (p.name && p.name.toLowerCase().includes(filteredQuery))
            );
        }

        // 2. ترتيب القطع من الكبير للصغير على حسب الـ Référence (ID)
        products = sortByIdDescending([...products]);

        let deleteSubBtn = '';
        if (currentMode === 'admin') {
            deleteSubBtn = `<button class="btn btn-outline-danger btn-sm ms-2" onclick="deleteSubCategory(${sIndex})"><i class="fa-solid fa-trash"></i></button>`;
        }

        let productsCardsHtml = '';
        products.forEach((p) => {
            // نجيبو الأنديكس الحقيقي للقطعة فـ الأراي الأصلية باش الحذف يخدم صح
            const realPIndex = subCat.products.indexOf(p);
            
            const priceVal = p.price !== "" && p.price !== null && p.price !== undefined ? parseFloat(p.price).toFixed(2) : "--";
            const displayPrice = isPriceVisible ? `${priceVal} DH` : `*** DH`;
            let deleteProdBtn = '';
            if (currentMode === 'admin') {
                deleteProdBtn = `<button class="btn btn-danger btn-sm me-1" onclick="deleteProduct(${sIndex}, ${realPIndex})"><i class="fa-solid fa-trash"></i></button>`;
            }

            productsCardsHtml += `
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="product-card-large" ondblclick="zoomProduct(${sIndex}, ${realPIndex})">
                        <div class="d-flex justify-content-between align-items-center p-2 bg-dark border-bottom border-secondary">
                            <span class="ref-badge-sm">${p.ref || 'N/A'}</span>
                            ${deleteProdBtn}
                        </div>
                        <div class="product-img-large-box">
                            <img src="${p.image || 'https://via.placeholder.com/300'}" alt="${p.name || ''}">
                        </div>
                        <div class="product-details-bottom text-center">
                            <div class="product-title-sm mb-1" title="${p.name || ''}">${p.name || 'بدون اسم'}</div>
                            <div class="product-price-sm">${displayPrice}</div>
                        </div>
                    </div>
                </div>
            `;
        });

        let addPlusCardHtml = '';
        if (currentMode === 'admin') {
            addPlusCardHtml = `
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="add-product-plus-card" onclick="openAddProductModal(${sIndex})">
                        <i class="fa-solid fa-plus fs-1 text-info mb-2"></i>
                        <span class="fw-bold text-info">إضافة قطعة</span>
                    </div>
                </div>
            `;
        }

        container.innerHTML += `
            <div class="sub-category-block border-bottom border-secondary pb-4">
                <div class="d-flex align-items-center mb-3">
                    <h4 class="fw-bold text-info m-0 border-start border-info border-4 ps-2">${subCat.title || 'صنف فرعي'}</h4>
                    ${deleteSubBtn}
                </div>
                <div class="row g-3">
                    ${productsCardsHtml}
                    ${addPlusCardHtml}
                </div>
            </div>
        `;
    });
}
function openAddProductModal(sIndex) {
    activeSubCategoryIndex = sIndex;
    new bootstrap.Modal(document.getElementById('addProductModal')).show();
}

function zoomProduct(sIndex, pIndex) {
    const prod = data[activeCategoryIndex].subCategories[sIndex].products[pIndex];
    document.getElementById('zoom-ref-badge').innerText = prod.ref || 'N/A';
    document.getElementById('zoom-title').innerText = prod.name || 'بدون اسم';
    document.getElementById('zoom-img').src = prod.image || 'https://via.placeholder.com/300';
    document.getElementById('zoom-info').innerText = '';
    
    const priceVal = prod.price !== "" && prod.price !== null && prod.price !== undefined ? parseFloat(prod.price).toFixed(2) : "--";
    document.getElementById('zoom-price').innerText = isPriceVisible ? `${priceVal} DH` : `*** DH`;
    
    new bootstrap.Modal(document.getElementById('zoomModal')).show();
}

/* إضافة بدون شروط الإلزامية */
function addCategory() {
    const title = document.getElementById('cat-title').value.trim();
    const fileInput = document.getElementById('cat-img-file');

    const save = (imgSrc) => {
        data.push({ 
            title: title || 'صنف جديد', 
            image: imgSrc || 'https://via.placeholder.com/300', 
            subCategories: [] 
        });
        saveData();
        renderCategories();
        finishModal('addCategoryModal', ['cat-title', 'cat-img-file']);
    };

    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => save(e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        save('');
    }
}

function addSubCategory() {
    const title = document.getElementById('subcat-title').value.trim();

    if (!data[activeCategoryIndex].subCategories) {
        data[activeCategoryIndex].subCategories = [];
    }

    data[activeCategoryIndex].subCategories.push({ 
        title: title || 'صنف فرعي جديد', 
        products: [] 
    });
    saveData();
    renderSubCategories();
    finishModal('addSubCategoryModal', ['subcat-title']);
}

function addProduct() {
    const ref = document.getElementById('prod-ref').value.trim();
    const name = document.getElementById('prod-name').value.trim();
    const price = document.getElementById('prod-price').value.trim();
    const fileInput = document.getElementById('prod-img-file');

    const save = (imgSrc) => {
        data[activeCategoryIndex].subCategories[activeSubCategoryIndex].products.push({
            ref: ref || 'N/A',
            name: name || 'قطعة بدون اسم',
            price: price !== "" ? price : null,
            available: true,
            image: imgSrc || 'https://via.placeholder.com/300'
        });
        saveData();
        renderSubCategories();
        finishModal('addProductModal', ['prod-ref', 'prod-name', 'prod-price', 'prod-img-file']);
    };

    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => save(e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        save('');
    }
}

function deleteCategory(e, index) {
    e.stopPropagation();
    if (confirm("حذف الصنف الرئيسي بالكامل؟")) {
        data.splice(index, 1);
        saveData();
        renderCategories();
    }
}

function deleteSubCategory(sIndex) {
    if (confirm("حذف هذا الصنف الفرعي بجميع قطعه؟")) {
        data[activeCategoryIndex].subCategories.splice(sIndex, 1);
        saveData();
        renderSubCategories();
    }
}

function deleteProduct(sIndex, pIndex) {
    if (confirm("حذف القطعة؟")) {
        data[activeCategoryIndex].subCategories[sIndex].products.splice(pIndex, 1);
        saveData();
        renderSubCategories();
    }
}

/* الشركات والفواتير */
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
                    <img src="${comp.image || 'https://via.placeholder.com/300'}" class="card-img-top" alt="${comp.title || ''}">
                    <div class="card-body text-center">
                        <h5 class="card-title fw-bold text-info m-0">${comp.title || 'شركة بدون اسم'}</h5>
                        <small class="text-muted">${comp.invoices ? comp.invoices.length : 0} فاتورة مصورة</small>
                    </div>
                </div>
            </div>
        `;
    });
}

function openCompany(index) {
    activeCompanyIndex = index;
    document.getElementById('current-company-title').innerText = `فواتير شركة: ${companies[index].title || ''}`;
    document.getElementById('companies-section').classList.add('d-none');
    document.getElementById('company-invoices-section').classList.remove('d-none');
    renderInvoices();
}
function renderInvoices(filteredList = null) {
    const container = document.getElementById('invoices-vertical-container');
    container.innerHTML = '';
    let invList = filteredList || companies[activeCompanyIndex].invoices;

    if (invList.length === 0) {
        container.innerHTML = `<div class="text-center py-5 text-muted fs-5">لا توجد فواتير مصورة لهذه الشركة.</div>`;
        return;
    }

    // ترتيب الفواتير من الكبير للصغير على حسب الـ ID
    invList = sortByIdDescending([...invList]);

    invList.forEach((inv) => {
        const realIndex = companies[activeCompanyIndex].invoices.indexOf(inv);
        let deleteBtn = '';
        if (currentMode === 'admin') {
            deleteBtn = `<button class="btn btn-danger btn-sm" onclick="deleteInvoice(${realIndex})"><i class="fa-solid fa-trash me-1"></i> حذف</button>`;
        }

        container.innerHTML += `
            <div class="invoice-card-full p-3">
                <div class="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-2">
                    <div>
                        <span class="badge bg-info text-dark fs-6 me-2">${inv.id || 'N/A'}</span>
                        <span class="fw-bold fs-4 text-white">${inv.title || 'فاتورة'}</span>
                    </div>
                    ${deleteBtn}
                </div>
                <div class="invoice-img-large-box">
                    <img src="${inv.image || 'https://via.placeholder.com/600x400'}" alt="${inv.title || ''}">
                </div>
            </div>
        `;
    });
}
function sortByIdDescending(list) {
    return list.sort((a, b) => {
        const idA = String(a.ref || a.id || '');
        const idB = String(b.ref || b.id || '');
        // الترتيب الأبجدي والرقمي العكسي (من الكبير للصغير)
        return idB.localeCompare(idA, undefined, { numeric: true, sensitivity: 'base' });
    });
}
function addCompany() {
    const title = document.getElementById('company-title').value.trim();
    const fileInput = document.getElementById('company-img-file');

    const save = (imgSrc) => {
        companies.push({ 
            title: title || 'شركة جديدة', 
            image: imgSrc || 'https://via.placeholder.com/300', 
            invoices: [] 
        });
        saveData();
        renderCompanies();
        finishModal('addCompanyModal', ['company-title', 'company-img-file']);
    };

    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => save(e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        save('');
    }
}

function addInvoice() {
    const ref = document.getElementById('invoice-ref').value.trim();
    const title = document.getElementById('invoice-title').value.trim();
    const fileInput = document.getElementById('invoice-img-file');

    const save = (imgSrc) => {
        companies[activeCompanyIndex].invoices.push({
            id: ref || 'N/A',
            title: title || 'فاتورة مصورة',
            image: imgSrc || 'https://via.placeholder.com/600x400'
        });
        saveData();
        renderInvoices();
        finishModal('addInvoiceModal', ['invoice-ref', 'invoice-title', 'invoice-img-file']);
    };

    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => save(e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        save('');
    }
}

function deleteCompany(e, index) {
    e.stopPropagation();
    if (confirm("حذف الشركة بجميع فواتيرها؟")) {
        companies.splice(index, 1);
        saveData();
        renderCompanies();
    }
}

function deleteInvoice(index) {
    if (confirm("حذف هذه الفاتورة؟")) {
        companies[activeCompanyIndex].invoices.splice(index, 1);
        saveData();
        renderInvoices();
    }
}

function filterProducts() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    renderSubCategories(query);
}

function filterInvoices() {
    const query = document.getElementById('invoice-search-input').value.toLowerCase().trim();
    const all = companies[activeCompanyIndex].invoices;
    if (!query) return renderInvoices(all);

    const filtered = all.filter(inv => 
        (inv.id && inv.id.toLowerCase().includes(query)) || 
        (inv.title && inv.title.toLowerCase().includes(query))
    );
    renderInvoices(filtered);
}

function finishModal(modalId, inputIds = []) {
    const el = document.getElementById(modalId);
    let inst = bootstrap.Modal.getInstance(el);
    if (!inst) inst = new bootstrap.Modal(el);
    inst.hide();

    inputIds.forEach(id => {
        const inp = document.getElementById(id);
        if (inp) inp.value = '';
    });
}