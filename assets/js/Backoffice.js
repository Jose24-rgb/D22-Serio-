const API_URL = "https://striveschool-api.herokuapp.com/api/product/";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2JkZmZhMzFlMTQwNjAwMTUzMTRkMzEiLCJpYXQiOjE3NDA1MTgxODgsImV4cCI6MTc0MTcyNzc4OH0.HujbpZ_KfXgIc9rz_w4Cu1n86L8YW9EdqH3Zb7ZixYU";

let allProducts = [];
let editingProductId = null;
let isEditMode = false;
let selectedProducts = []; // Array per tenere traccia dei prodotti selezionati

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
    resetSelectedCards(); 
});

document.getElementById("delete-selected-btn").addEventListener("click", deleteSelectedProducts);

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

function resetSelectedCards() {
    const selectedCards = document.querySelectorAll(".product-card.selected");
    selectedCards.forEach(card => {
        card.classList.remove("selected");
        card.classList.add("deselected"); // Per mantenere la card nel suo stato normale
    });
}

function selectProductForEditing(event) {
    if (!isEditMode) return;

    const productId = event.currentTarget.getAttribute("data-id");
    const productCard = event.currentTarget;

    // Deseleziona il precedente prodotto selezionato, se c'era
    const previouslySelectedCard = document.querySelector(".product-card.selected");
    if (previouslySelectedCard && previouslySelectedCard !== productCard) {
        previouslySelectedCard.classList.remove("selected");
        previouslySelectedCard.classList.add("deselected");
    }

    // Seleziona il nuovo prodotto
    productCard.classList.add("selected");
    productCard.classList.remove("deselected");

    // Mostra i dettagli del prodotto selezionato nel modulo di modifica
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
                    <input type="checkbox" class="product-checkbox" data-id="${product._id}" onchange="toggleProductSelection(event, '${product._id}')">
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

// Funzione per la selezione dei prodotti tramite checkbox
function toggleProductSelection(event, productId) {
    if (event.target.checked) {
        selectedProducts.push(productId); // Aggiungi il prodotto selezionato
    } else {
        selectedProducts = selectedProducts.filter(id => id !== productId); // Rimuovi il prodotto deselezionato
    }
    toggleDeleteButton(); // Controlla se mostrare il pulsante "Elimina Selezionati"
}

// Funzione per mostrare o nascondere il pulsante "Elimina Selezionati"
function toggleDeleteButton() {
    const deleteButton = document.getElementById("delete-selected-btn");
    if (selectedProducts.length > 0) {
        deleteButton.style.display = "inline-block"; // Mostra il pulsante
    } else {
        deleteButton.style.display = "none"; // Nascondi il pulsante
    }
}

// Funzione per eliminare i prodotti selezionati
async function deleteSelectedProducts() {
    if (selectedProducts.length === 0) return;

    if (confirm("Sei sicuro di voler eliminare questi prodotti?")) {
        try {
            for (const productId of selectedProducts) {
                await deleteProduct(productId); // Elimina ciascun prodotto selezionato
            }
            selectedProducts = []; // Resetta la lista dei prodotti selezionati
            toggleDeleteButton(); // Nascondi il pulsante
            alert("Prodotti eliminati con successo.");
        } catch (error) {
            console.error("Errore:", error);
            alert("Si è verificato un errore durante l'eliminazione dei prodotti.");
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
    resetSelectedCards(); // Rimuovi l'evidenziazione da tutte le card
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












