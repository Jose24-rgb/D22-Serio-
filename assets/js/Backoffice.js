const API_URL = "https://striveschool-api.herokuapp.com/api/product/";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2JkZmZhMzFlMTQwNjAwMTUzMTRkMzEiLCJpYXQiOjE3NDA1MTgxODgsImV4cCI6MTc0MTcyNzc4OH0.HujbpZ_KfXgIc9rz_w4Cu1n86L8YW9EdqH3Zb7ZixYU";

let allProducts = [];
let editingProductId = null;
let isEditMode = false;

document.getElementById("add-product-btn").addEventListener("click", () => {
    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const imageUrl = document.getElementById("imageUrl").value.trim();
    const price = parseFloat(document.getElementById("price").value);

    if (!name || !description || !brand || !isValidURL(imageUrl) || isNaN(price) || price <= 0) {
        alert("Compila tutti i campi correttamente.");
        return;
    }

    const productData = { name, description, brand, imageUrl, price };

    if (editingProductId) {
        updateProduct(editingProductId, productData);
    } else {
        addProduct(productData);
    }
});

document.getElementById("edit-mode-btn").addEventListener("click", () => {
    toggleEditMode();
});

function toggleEditMode() {
    if (isEditMode) {
        isEditMode = false;
        document.getElementById("edit-mode-btn").textContent = "Modificare";
        editingProductId = null;
        document.getElementById("save-changes-btn").style.display = "none";
        resetProductCards();
    } else {
        isEditMode = true;
        document.getElementById("edit-mode-btn").textContent = "Annulla Modifica";
        highlightEditableCards();
    }
}

function highlightEditableCards() {
    const productCards = document.querySelectorAll(".product-card");
    productCards.forEach(card => {
        card.classList.add("border-warning");
        card.addEventListener("click", selectProductForEditing);
    });
}

function resetProductCards() {
    const productCards = document.querySelectorAll(".product-card");
    productCards.forEach(card => {
        card.classList.remove("border-warning");
        card.removeEventListener("click", selectProductForEditing);
    });
}

function selectProductForEditing(event) {
    if (!isEditMode) return;
    const productId = event.currentTarget.getAttribute("data-id");
    fetchProductData(productId).then(productData => {
        if (productData) {
            populateForm(productData);
            editingProductId = productId;
            document.getElementById("save-changes-btn").style.display = "inline-block";
        }
    });
}

async function addProduct(newProduct) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify(newProduct)
        });
        if (!response.ok) {
            throw new Error("Errore durante l'aggiunta del prodotto.");
        }
        await fetchProducts();
    } catch (error) {
        console.error("Errore:", error);
    }
}

async function updateProduct(productId, updatedProduct) {
    document.getElementById("save-changes-btn").disabled = true;

    try {
        await fetch(`${API_URL}${productId}`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify(updatedProduct)
        });
        await fetchProducts();
        document.getElementById("save-changes-btn").style.display = "none";
        editingProductId = null;
        document.getElementById("edit-mode-btn").textContent = "Modificare";
    } catch (error) {
        console.error("Errore:", error);
    } finally {
        document.getElementById("save-changes-btn").disabled = false;
    }
}

async function fetchProducts() {
    const response = await fetch(API_URL, { headers: { "Authorization": `Bearer ${TOKEN}` } });
    allProducts = await response.json();
    renderProducts(allProducts);
}

function renderProducts(products) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";
    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("col-md-4", "product-card");
        productCard.setAttribute("data-id", product._id);
        productCard.innerHTML = 
            `<div class="card mb-4">
                <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="card-text"><strong>€${product.price}</strong></p>
                    <a href="product.html?id=${product._id}" class="btn btn-primary">Dettagli</a>
                    <button class="btn btn-warning" onclick="editProduct('${product._id}')">Modifica</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Elimina</button>
                </div>
            </div>`;
        productList.appendChild(productCard);
    });
}

function searchProducts() {
    const searchTerm = document.getElementById("search-input").value.toLowerCase();
    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
}

async function fetchProductData(productId) {
    const response = await fetch(`${API_URL}${productId}`, { headers: { "Authorization": `Bearer ${TOKEN}` } });
    return response.json();
}

async function deleteProduct(productId) {
    if (confirm("Sei sicuro di voler eliminare questo prodotto?")) {
        try {
            const response = await fetch(`${API_URL}${productId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${TOKEN}` }
            });

            if (response.ok) {
                alert("Prodotto eliminato con successo.");
                await fetchProducts(); // Ricarica i prodotti
            } else {
                throw new Error("Errore durante l'eliminazione del prodotto.");
            }
        } catch (error) {
            console.error("Errore:", error);
            alert("Si è verificato un errore durante l'eliminazione del prodotto.");
        }
    }
}

function isValidURL(url) {
    const pattern = new RegExp('^(https?:\\/\\/)?([\\w\\d\\-]+\\.)+[\\w\\d\\-]{2,4}(\\/.*)?$', 'i');
    return pattern.test(url);
}

document.addEventListener("DOMContentLoaded", fetchProducts);

document.getElementById("save-changes-btn").addEventListener("click", () => {
    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const imageUrl = document.getElementById("imageUrl").value.trim();
    const price = parseFloat(document.getElementById("price").value);

    if (!editingProductId) return;
    updateProduct(editingProductId, { name, description, brand, imageUrl, price });

    // Dopo aver salvato le modifiche, cambia il pulsante a "Modificare"
    document.getElementById("edit-mode-btn").textContent = "Modificare";
});

function editProduct(productId) {
    fetchProductData(productId).then(productData => {
        if (productData) {
            populateForm(productData);
            editingProductId = productId;
        }
    });
}

function populateForm(productData) {
    document.getElementById("name").value = productData.name;
    document.getElementById("description").value = productData.description;
    document.getElementById("brand").value = productData.brand;
    document.getElementById("imageUrl").value = productData.imageUrl;
    document.getElementById("price").value = productData.price;
    document.getElementById("save-changes-btn").style.display = "inline-block";
}

fetchProducts();











