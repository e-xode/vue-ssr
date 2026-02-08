export const emailTemplates = {
  securityCode: {
    subject: 'Your security code',
    html: (code) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0; }
          .content { padding: 20px 0; }
          .code-box { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563eb; font-family: 'Courier New', monospace; }
          .expiry { font-size: 12px; color: #6b7280; margin-top: 15px; }
          .footer { border-top: 2px solid #f0f0f0; padding: 20px 0; margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #2563eb;">App</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Your security code:</p>
            <div class="code-box">
              <div class="code">${code}</div>
              <div class="expiry">This code expires in 10 minutes</div>
            </div>
            <p style="margin-top: 20px;">If you did not request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2026 App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}
