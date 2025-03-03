const API_URL = "https://striveschool-api.herokuapp.com/api/product/";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2JkZmZhMzFlMTQwNjAwMTUzMTRkMzEiLCJpYXQiOjE3NDA1MTgxODgsImV4cCI6MTc0MTcyNzc4OH0.HujbpZ_KfXgIc9rz_w4Cu1n86L8YW9EdqH3Zb7ZixYU";

async function fetchProductById(productId) {
    try {
        const response = await fetch(`${API_URL}${productId}`, { 
            headers: {
                "Authorization": `Bearer ${TOKEN}`
            }
        });
        const product = await response.json();
        populateForm(product);
    } catch (error) {
        console.error("Errore nel recupero del prodotto", error);
    }
}

function populateForm(product) {
    document.getElementById("name").value = product.name;
    document.getElementById("description").value = product.description;
    document.getElementById("brand").value = product.brand;
    document.getElementById("imageUrl").value = product.imageUrl;
    document.getElementById("price").value = product.price;
}

document.getElementById("edit-product-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const productId = new URLSearchParams(window.location.search).get("id");
    const updatedProduct = {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value,
        brand: document.getElementById("brand").value,
        imageUrl: document.getElementById("imageUrl").value,
        price: parseFloat(document.getElementById("price").value)
    };

    try {
        const response = await fetch(`${API_URL}${productId}`,   { 
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedProduct)
        });

        if (response.ok) {
            alert("Prodotto modificato con successo!");
            window.location.href = "index.html";
        } else {
            alert("Errore nella modifica del prodotto");
        }
    } catch (error) {
        console.error("Errore nella richiesta", error);
    }
});

const productId = new URLSearchParams(window.location.search).get("id");
if (productId) {
    fetchProductById(productId);
}
