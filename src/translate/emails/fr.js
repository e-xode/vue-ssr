const baseStyle = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0; }
  .content { padding: 20px 0; }
  .code-box { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; }
  .code { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563eb; font-family: 'Courier New', monospace; }
  .expiry { font-size: 12px; color: #6b7280; margin-top: 15px; }
  .footer { border-top: 2px solid #f0f0f0; padding: 20px 0; margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
`

const appName = process.env?.APP_NAME || 'App'
const year = new Date().getFullYear()

export const emailTemplates = {
  securityCode: {
    subject: `Votre code de sécurité ${appName}`,
    html: (code) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>${baseStyle}</style></head>
<body>
  <div class="container">
    <div class="header"><h1 style="margin:0;color:#2563eb;">${appName}</h1></div>
    <div class="content">
      <p>Bonjour,</p>
      <p>Voici votre code de sécurité :</p>
      <div class="code-box">
        <div class="code">${code}</div>
        <div class="expiry">Ce code expire dans 10 minutes</div>
      </div>
      <p style="margin-top:20px;">Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
    </div>
    <div class="footer"><p>© ${year} ${appName}. Tous droits réservés.</p></div>
  </div>
</body>
</html>`
  },
  welcome: {
    subject: (name) => `Bienvenue sur ${appName}, ${name} !`,
    html: (name) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>${baseStyle}</style></head>
<body>
  <div class="container">
    <div class="header"><h1 style="margin:0;color:#2563eb;">${appName}</h1></div>
    <div class="content">
      <p>Bonjour ${name},</p>
      <p>Votre compte a été créé avec succès. Bienvenue !</p>
      <p>Vous pouvez maintenant vous connecter et commencer à utiliser votre compte.</p>
    </div>
    <div class="footer"><p>© ${year} ${appName}. Tous droits réservés.</p></div>
  </div>
</body>
</html>`
  },
  contact: {
    subject: (data) => `Nouveau message de contact de ${data.name}`,
    html: (data) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>${baseStyle}</style></head>
<body>
  <div class="container">
    <div class="header"><h1 style="margin:0;color:#2563eb;">${appName} — Contact</h1></div>
    <div class="content">
      <p><strong>Nom :</strong> ${data.name}</p>
      <p><strong>Email :</strong> ${data.email}</p>
      <p><strong>Message :</strong></p>
      <p style="white-space:pre-wrap;">${data.message}</p>
    </div>
    <div class="footer"><p>© ${year} ${appName}. Tous droits réservés.</p></div>
  </div>
</body>
</html>`
  }
}
