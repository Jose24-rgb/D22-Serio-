const API_URL = "https://striveschool-api.herokuapp.com/api/product/";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2JkZmZhMzFlMTQwNjAwMTUzMTRkMzEiLCJpYXQiOjE3NDA1MTgxODgsImV4cCI6MTc0MTcyNzc4OH0.HujbpZ_KfXgIc9rz_w4Cu1n86L8YW9EdqH3Zb7ZixYU";

let allProducts = [];

async function fetchProducts() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                "Authorization": `Bearer ${TOKEN}`
            }
        });
        if (!response.ok) {
            throw new Error("Errore nella risposta dell'API: " + response.statusText);
        }
        allProducts = await response.json();
        renderProducts(allProducts);
    } catch (error) {
        console.error("Errore nel recupero dei prodotti", error);
    }
}

function renderProducts(products) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";
    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("col-md-4");
        productCard.innerHTML = `
         <div class="card mb-4">
          <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="card-text"><strong>€${product.price}</strong></p>
                    <a href="product.html?id=${product._id}" class="btn btn-primary">Dettagli</a> 
                </div>
            </div>
        `;
        productList.appendChild(productCard);
    });
}

// Funzione di ricerca
function searchProducts() {
    const searchTerm = document.getElementById("search-input").value.toLowerCase();
    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
}

fetchProducts();

