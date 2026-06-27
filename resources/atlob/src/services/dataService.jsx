const API_URL = process.env.REACT_APP_API_URL;

const handleResponse = async (res) => {
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "API Error");
  return data;
};

const dataService = {
  getCraftsmen: () =>
    fetch(`${API_URL}/craftsmen`).then(handleResponse),

  getPendingCraftsmen: () =>
    fetch(`${API_URL}/craftsmen?verified=false`).then(handleResponse),

  verifyCraftsman: (id) =>
    fetch(`${API_URL}/craftsmen/${id}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" }
    }).then(handleResponse),

  getUsers: () =>
    fetch(`${API_URL}/users`).then(handleResponse),

  createRequest: (data) =>
    fetch(`${API_URL}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),

  getRequests: () =>
    fetch(`${API_URL}/requests`).then(handleResponse),

  addReview: (data) =>
    fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),

  getReviews: () =>
    fetch(`${API_URL}/reviews`).then(handleResponse),

  sendMessage: (data) =>
    fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),

  getMessages: (email) =>
    fetch(`${API_URL}/messages?user=${encodeURIComponent(email)}`).then(handleResponse),

  saveCraftsman: (data) =>
    fetch(`${API_URL}/craftsmen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
};

export default dataService;