export function loginEmailHtml(url: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign in</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="font-size:28px;font-weight:800;color:#1a1a2e;letter-spacing:-1px;">
                Music Practice
              </div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;padding:40px 36px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">

              <!-- Greeting -->
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a2e;text-align:center;">
                Welcome!
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#6b7280;text-align:center;line-height:1.6;">
                We received a sign-in request for your account.<br />
                Click the button below to continue.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <a href="${url}"
                       style="display:inline-block;background-color:#4f46e5;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 40px;border-radius:10px;letter-spacing:0.3px;">
                      Sign in
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 24px;" />

              <!-- Expiry note -->
              <p style="margin:0 0 16px;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;">
                This link is valid for 24 hours.<br />
                If you did not request this, you can safely ignore this email.
              </p>

              <!-- Fallback URL -->
              <p style="margin:0;font-size:12px;color:#d1d5db;text-align:center;">
                If the button doesn't work, copy this link:<br />
                <span style="color:#9ca3af;word-break:break-all;">${url}</span>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                &copy; ${new Date().getFullYear()} Music Practice
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function loginEmailText(url: string): string {
  return `Welcome!\n\nClick the following link to sign in:\n${url}\n\nThis link is valid for 24 hours.\nIf you did not request this, you can safely ignore this email.\n\n© ${new Date().getFullYear()} Music Practice`;
}
