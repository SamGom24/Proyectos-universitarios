// ===============================
// CONFIGURACIÓN BASE DE LA API
// ===============================
export const API_URL = "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Error en la petición");
  }

  return res.status !== 204 ? res.json() : null;
}

// ===============================
// CATEGORÍAS
// ===============================
export function obtenerCategorias() {
  return request("/categorias/");
}

export function obtenerCategoria(id) {
  return request(`/categorias/${id}`);
}

export function crearCategoria(data) {
  return request("/categorias/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function borrarCategoria(id) {
  return request(`/categorias/${id}`, {
    method: "DELETE",
  });
}

// ===============================
// PLATOS
// ===============================
export function obtenerPlatos() {
  return request("/platos/");
}

export function obtenerPlato(id) {
  return request(`/platos/${id}`);
}

export function crearPlato(data) {
  return request("/platos/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function modificarPlato(id, data) {
  return request(`/platos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function borrarPlato(id) {
  return request(`/platos/${id}`, {
    method: "DELETE",
  });
}

export async function subirImagenPlato(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/platos/upload-image`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Error al subir la imagen");
  }

  return res.json();
}

// ===============================
// MENÚ DIARIO
// ===============================
export function consultarMenuDiario(fecha) {
  return request(`/menu-diario/${fecha}`);
}

export function obtenerMenuDiario(fecha) {
  return request(`/menu-diario/${fecha}`);
}

export function crearMenuDiario(data) {
  return request("/menu-diario/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ===============================
// PEDIDOS
// ===============================
export function crearPedido(data) {
  return request("/pedidos/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function obtenerPedidos() {
  return request("/pedidos/");
}
