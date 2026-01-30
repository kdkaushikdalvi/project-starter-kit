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

export async function getDocumentsList() {
  const response = await fetch(`${API_BASE_URL}/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response;
}
