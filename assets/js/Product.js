const API_URL = "https://striveschool-api.herokuapp.com/api/product/";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2JkZmZhMzFlMTQwNjAwMTUzMTRkMzEiLCJpYXQiOjE3NDA1MTgxODgsImV4cCI6MTc0MTcyNzc4OH0.HujbpZ_KfXgIc9rz_w4Cu1n86L8YW9EdqH3Zb7ZixYU";

async function fetchProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    if (!productId) {
        const productDetails = document.getElementById("product-details");
        productDetails.innerHTML = '<p>Prodotto non trovato. Torna alla lista dei prodotti.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_URL}${productId}`, { 
            headers: {
                "Authorization": `Bearer ${TOKEN}`  
            }
        });

        if (!response.ok) {
            const productDetails = document.getElementById("product-details");
            productDetails.innerHTML = '<p>Prodotto non trovato.</p>';
            return;
        }

        const product = await response.json();
        renderProductDetails(product);
    } catch (error) {
        console.error("Errore nel recupero dei dettagli del prodotto", error);
    }
}

function renderProductDetails(product) {
    const productDetails = document.getElementById("product-details");
    productDetails.innerHTML = `
        <h1>${product.name}</h1>
        <img src="${product.imageUrl}" class="img-fluid" alt="${product.name}">
        <p><strong>Descrizione:</strong> ${product.description}</p>
        <p><strong>Marca:</strong> ${product.brand}</p>
        <p><strong>Prezzo:</strong> €${product.price}</p>
    `;
}

fetchProductDetails();
