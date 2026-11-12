import { SECURITY_CODE_EXPIRY_MS } from '#src/shared/const.js';

export const appName = process.env?.APP_NAME || 'App';

export const codeExpiryMinutes = SECURITY_CODE_EXPIRY_MS / (60 * 1000);

const year = new Date().getFullYear();

const baseStyle = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0; }
  .content { padding: 20px 0; }
  .code-box { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; }
  .code { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #4f46e5; font-family: 'Courier New', monospace; }
  .expiry { font-size: 12px; color: #6b7280; margin-top: 15px; }
  .footer { border-top: 2px solid #f0f0f0; padding: 20px 0; margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
`;

export function renderEmail({ title = appName, content, rights }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>${baseStyle}</style></head>
<body>
  <div class="container">
    <div class="header"><h1 style="margin:0;color:#4f46e5;">${title}</h1></div>
    <div class="content">${content}</div>
    <div class="footer"><p>© ${year} ${appName}. ${rights}</p></div>
  </div>
</body>
</html>`;
}

export function renderCodeBox(code, expiryText) {
  return `<div class="code-box">
        <div class="code">${code}</div>
        <div class="expiry">${expiryText}</div>
      </div>`;
}
