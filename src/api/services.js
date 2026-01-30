const API_BASE_URL = "https://ifli.digitalfd.net:9002";

export async function submitSignedDocument(payload) {
  const response = await fetch(`${API_BASE_URL}/api/documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response;
}

export async function getDocumentsByUserId(userId) {
  const response = await fetch(`${API_BASE_URL}/api/documents/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Default export for compatibility (some environments treat local .js modules as default-only).
export default {
  submitSignedDocument,
  getDocumentsByUserId,
};
