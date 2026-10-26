let currentMode = null;
let activeCategoryIndex = null;
let activeAlbumIndex = null;
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

const defaultAlbums = [
    {
        title: "Samsung",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=500&q=80",
        photos: [
            { title: "Galaxy S23 Ultra", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=300&q=80" }
        ]
    },
    {
        title: "iPhone",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80",
        photos: []
    }
];

let data = JSON.parse(localStorage.getItem('auto_parts_data')) || defaultData;
let albums = JSON.parse(localStorage.getItem('auto_parts_albums')) || defaultAlbums;

function saveData() {
    localStorage.setItem('auto_parts_data', JSON.stringify(data));
    localStorage.setItem('auto_parts_albums', JSON.stringify(albums));
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
    document.getElementById('galerie-nav-btn').classList.remove('d-none');
    document.getElementById('facture-switch-container').classList.remove('d-none');

    const badge = document.getElementById('role-badge');
    if (currentMode === 'admin') {
        badge.className = "badge bg-danger fs-6";
        badge.innerText = "وضع التعديلات (Admin)";
        document.getElementById('admin-banner').classList.remove('d-none');
        document.getElementById('admin-add-product-btn').classList.remove('d-none');
        document.getElementById('admin-add-album-btn').classList.remove('d-none');
        document.getElementById('admin-add-album-photo-btn').classList.remove('d-none');
    } else {
        badge.className = "badge bg-primary fs-6";
        badge.innerText = "وضع المعلومات (Client)";
        document.getElementById('admin-banner').classList.add('d-none');
        document.getElementById('admin-add-product-btn').classList.add('d-none');
        document.getElementById('admin-add-album-btn').classList.add('d-none');
        document.getElementById('admin-add-album-photo-btn').classList.add('d-none');
    }

    showSection('categories-section');
}

function showSection(sectionId) {
    if (sectionId === 'welcome-section') {
        document.getElementById('welcome-section').classList.remove('d-none');
        document.getElementById('app-content').classList.add('d-none');
        document.getElementById('home-btn').classList.add('d-none');
        document.getElementById('galerie-nav-btn').classList.add('d-none');
        document.getElementById('facture-switch-container').classList.add('d-none');
        document.getElementById('view-facture-btn').classList.add('d-none');
        document.getElementById('role-badge').className = "badge bg-secondary";
        document.getElementById('role-badge').innerText = "اختر الوضع";
        return;
    }

    document.getElementById('categories-section').classList.add('d-none');
    document.getElementById('products-section').classList.add('d-none');
    document.getElementById('galerie-section').classList.add('d-none');
    document.getElementById('album-details-section').classList.add('d-none');

    if (sectionId === 'categories-section') {
        document.getElementById('categories-section').classList.remove('d-none');
        renderCategories();
    } else if (sectionId === 'galerie-section') {
        document.getElementById('galerie-section').classList.remove('d-none');
        renderAlbums();
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

function zoomProduct(realIndex) {
    const prod = data[activeCategoryIndex].products[realIndex];
    document.getElementById('zoom-ref-badge').innerText = prod.ref || 'N/A';
    document.getElementById('zoom-title').innerText = prod.name;
    document.getElementById('zoom-img').src = prod.image || 'https://via.placeholder.com/150';
    document.getElementById('zoom-info').innerText = prod.info || '';
    document.getElementById('zoom-price').innerText = isPriceVisible ? `${parseFloat(prod.price).toFixed(2)} DH` : `*** DH`;
    
    new bootstrap.Modal(document.getElementById('zoomModal')).show();
}

/* GALERIE ALBUMS */
function renderAlbums() {
    const container = document.getElementById('albums-container');
    container.innerHTML = '';

    albums.forEach((album, index) => {
        let deleteBtn = '';
        if (currentMode === 'admin') {
            deleteBtn = `<button class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 z-3" onclick="deleteAlbum(event, ${index})"><i class="fa-solid fa-trash"></i></button>`;
        }

        container.innerHTML += `
            <div class="col-md-4 col-sm-6">
                <div class="card category-card border-0 shadow-sm h-100 position-relative" onclick="openAlbum(${index})">
                    ${deleteBtn}
                    <img src="${album.image}" class="card-img-top" alt="${album.title}">
                    <div class="card-body text-center">
                        <h5 class="card-title fw-bold text-info m-0">${album.title}</h5>
                        <small class="text-muted">${album.photos.length} صورة</small>
                    </div>
                </div>
            </div>
        `;
    });
}

function openAlbum(index) {
    activeAlbumIndex = index;
    document.getElementById('current-album-title').innerText = albums[index].title;
    document.getElementById('galerie-section').classList.add('d-none');
    document.getElementById('album-details-section').classList.remove('d-none');
    renderAlbumPhotos();
}

function renderAlbumPhotos() {
    const container = document.getElementById('album-photos-container');
    container.innerHTML = '';
    const photos = albums[activeAlbumIndex].photos;

    if (photos.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5 text-muted">لا توجد صور في هذا الألبوم.</div>`;
        return;
    }

    photos.forEach((photo, pIndex) => {
        let deleteBtn = '';
        if (currentMode === 'admin') {
            deleteBtn = `<button class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 z-3" onclick="deleteAlbumPhoto(${pIndex})"><i class="fa-solid fa-trash"></i></button>`;
        }

        container.innerHTML += `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="card product-card h-100 position-relative">
                    ${deleteBtn}
                    <div class="product-img-box" style="height: 200px;">
                        <img src="${photo.image}" alt="${photo.title}">
                    </div>
                    <div class="p-2 text-center">
                        <div class="fw-bold text-white small">${photo.title}</div>
                    </div>
                </div>
            </div>
        `;
    });
}

function addAlbum() {
    const title = document.getElementById('album-title').value.trim();
    const fileInput = document.getElementById('album-img-file');
    if (!title) return;

    const save = (imgSrc) => {
        albums.push({ title: title, image: imgSrc, photos: [] });
        saveData();
        renderAlbums();
        finishModal('addAlbumModal', ['album-title', 'album-img-file']);
    };

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => save(e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        save('https://via.placeholder.com/300');
    }
}

function addAlbumPhoto() {
    const title = document.getElementById('photo-title').value.trim();
    const fileInput = document.getElementById('photo-img-file');

    if (!fileInput.files || !fileInput.files[0]) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        albums[activeAlbumIndex].photos.push({
            title: title || 'صورة',
            image: e.target.result
        });
        saveData();
        renderAlbumPhotos();
        finishModal('addAlbumPhotoModal', ['photo-title', 'photo-img-file']);
    };
    reader.readAsDataURL(fileInput.files[0]);
}

function deleteAlbum(e, index) {
    e.stopPropagation();
    if (confirm(`حذف الألبوم بالكامل؟`)) {
        albums.splice(index, 1);
        saveData();
        renderAlbums();
    }
}

function deleteAlbumPhoto(index) {
    if (confirm(`حذف الصورة؟`)) {
        albums[activeAlbumIndex].photos.splice(index, 1);
        saveData();
        renderAlbumPhotos();
    }
}

/* FACTURE FUNCTIONS */
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