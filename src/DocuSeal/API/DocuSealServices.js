const DOCUSEAL_API_URL = import.meta.env.VITE_DOCUSEAL_URL;
const DOCUSEAL_API_KEY = import.meta.env.VITE_DOCUSEAL_KEY;
const MAIL_API_URL = import.meta.env.VITE_MAIL_URL;

const userName = sessionStorage.getItem("username");

export async function submitDocument({ file, fields, email, referenceNumber }) {
  if (!email) {
    throw new Error("Email is required");
  }
  if (!file) {
    throw new Error("PDF file is required");
  }
  if (!fields?.length) {
    throw new Error("At least one field is required");
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64Pdf = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""));

  const payload = {
    name: "Submission Document",
    documents: [
      {
        name: file.name,
        role: "Signer",
        file: base64Pdf,
        fields,
      },
    ],
    username: email,
    referenceNumber: referenceNumber,
    submitters: [
      {
        role: "Signer",
        email,
      },
    ],
  };

  const res = await fetch(`${DOCUSEAL_API_URL}/documentSubmissions/pdf?include=fields`, {
    method: "POST",
    headers: {
      "X-Auth-Token": DOCUSEAL_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Template creation failed");
  }

  return data;
}

export async function submitSignature({ submitterId, values, completed = true }) {
  if (!submitterId) {
    throw new Error("submitterId is required");
  }
  const response = await fetch(`${DOCUSEAL_API_URL}/submitters/${submitterId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": DOCUSEAL_API_KEY,
    },
    body: JSON.stringify({
      values,
      completed,
    }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error || "Submitter submission failed");
  }
  return response.json();
}

export async function getAllDocument({ page = 1, limit = 10, status = "ALL", search = "" }) {
  const params = new URLSearchParams({
    page,
    limit,
    username: userName,
  });

  if (status !== "ALL") params.append("status", status);
  if (search) params.append("referenceNumber", search);

  const response = await fetch(`${DOCUSEAL_API_URL}/documentSubmissions/pdf?${params.toString()}`, {
    headers: {
      "X-Auth-Token": DOCUSEAL_API_KEY,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error || "Failed to fetch document submissions");
  }

  return response.json();
}

export async function sendMailLink({ to, token }) {
  const response = await fetch(`${DOCUSEAL_API_URL}/reviewandsigndocument`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": DOCUSEAL_API_KEY,
    },
    body: JSON.stringify({
      to,
      token,
    }),
  });

  if (!response.ok) {
    throw new Error(`Mail API failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}
