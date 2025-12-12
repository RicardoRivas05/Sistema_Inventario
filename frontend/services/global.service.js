const API_BASE_URL = "http://localhost:3001"; // Aqui va la URL de cada quien del backend

export const globalService = {
    
    async get(endpoint) {
        return await request("GET", endpoint);
    },

    async post(endpoint, data) {
        return await request("POST", endpoint, data);
    },

    async put(endpoint, data) {
        return await request("PUT", endpoint, data);
    },

    async delete(endpoint) {
        return await request("DELETE", endpoint);
    }
};


async function request(method, endpoint, data = null) {
    try {
        const options = {
            method,
            headers: {
                "Content-Type": "application/json"
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        // Si el backend devolvió error retornara este mensaje
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Error en la petición");
        }

        return await response.json();

    } catch (error) {
        console.error("GlobalService Error:", error.message);
        throw error;
    }
}
