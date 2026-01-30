const API_BASE_URL = "https://ifli.digitalfd.net:9002";

export interface DocumentPayload {
  document: {
    id: string;
    user_id: string;
    name: string;
    file_url: string;
    num_pages: number;
    status: string;
    submission_type: string;
    recipient_email: string;
    created_at: string;
    updated_at: string;
    signed_at: string;
    signed_file_url: string;
  };
  signatureField: {
    id: string;
    document_id: string;
    signer_id: string;
    page_number: number;
    x: number;
    y: number;
    width: number;
    height: number;
    is_signed: boolean;
    signature_type: string;
    signature_url: string;
    signed_at: string;
  };
}

export async function submitSignedDocument(payload: DocumentPayload): Promise<Response> {
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

export async function getDocumentsList(): Promise<Response> {
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
