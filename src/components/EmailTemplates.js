export const generateEmailTemplate = (signUrl) => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Action Required: Sign Your Document</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f0f9ff; font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
      <tr>
        <td align="center">

          <!-- Main Card -->
          <table width="100%" cellpadding="0" cellspacing="0"
            style="max-width:540px; background:#ffffff; border-radius:28px;
                   border:1px solid #e0f2fe;
                   box-shadow:0 12px 48px rgba(14,165,233,0.12);">

            <!-- Header -->
            <tr>
              <td style="padding:48px 40px 32px; text-align:center;">
                <h1 style="margin:0; font-size:28px; font-weight:800; color:#0f172a; letter-spacing:-0.03em;">
                  Solidarity Hub
                </h1>
                <p style="margin:10px 0 0; font-size:14px; font-weight:600;
                          letter-spacing:0.12em; text-transform:uppercase; color:#0284c7;">
                   •  Document Signature Required
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:0 48px 40px; text-align:center;">
                <p style="margin:0; font-size:16px; line-height:1.7; color:#475569;">
                  A document has been shared with you via <strong>Solidarity Hub</strong> and requires your electronic signature.
                  This secure link is intended only for you.
                </p>

                <!-- CTA -->
                <table cellpadding="0" cellspacing="0" style="margin:36px auto 0;">
                  <tr>
                    <td align="center"
                      style="background:#0ea5e9; border-radius:16px;
                             box-shadow:0 10px 22px rgba(14,165,233,0.35);">
                      <a href="${signUrl}" target="_blank"
                        style="display:inline-block; padding:18px 48px;
                               font-size:16px; font-weight:700;
                               color:#ffffff; text-decoration:none;">
                        Review & Sign Document
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:18px 0 0; font-size:12px; font-weight:600;
                          color:#94a3b8; letter-spacing:0.05em; text-transform:uppercase;">
                  Link valid for 24 hours
                </p>
              </td>
            </tr>

            <!-- Security Info -->
            <tr>
              <td style="padding:0 48px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#f8fafc; border-radius:18px;
                         border:1px solid #e2e8f0;">
                  <tr>
                    <td style="padding:20px; font-size:14px; color:#64748b;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="font-weight:700; color:#334155;">Platform</td>
                          <td align="right">Solidarity Hub – PDFSign</td>
                        </tr>
                        <tr>
                          <td style="padding-top:8px; font-weight:700; color:#334155;">Security</td>
                          <td align="right" style="color:#10b981; font-weight:700;">
                            AES-256 Encryption
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Fallback Link -->
            <tr>
              <td style="padding:32px 48px; border-top:1px solid #e2e8f0;
                         background:#fcfdfe; text-align:center;">
                <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.6;">
                  If the button doesn't work, copy and paste this link into your browser:<br />
                  <a href="${signUrl}" style="color:#0284c7; word-break:break-all;">
                    ${signUrl}
                  </a>
                </p>
              </td>
            </tr>

          </table>

          <!-- Footer -->
          <table width="100%" cellpadding="0" cellspacing="0"
            style="max-width:540px; margin-top:24px;">
            <tr>
              <td align="center" style="font-size:12px; color:#cbd5e1; line-height:1.6;">
                Sent securely by <strong>Solidarity Hub</strong><br />
                Privacy Policy • Security • Support<br /><br />
                © 2026 Solidarity Hub
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
