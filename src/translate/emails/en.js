import { appName, codeExpiryMinutes, renderCodeBox, renderEmail } from './layout.js';

const rights = 'All rights reserved.';
const expiryText = `This code expires in ${codeExpiryMinutes} minutes`;

function renderCodeEmail(code, { intro, ignore }) {
  return renderEmail({
    rights,
    content: `
      <p>Hello,</p>
      <p>${intro}</p>
      ${renderCodeBox(code, expiryText)}
      <p style="margin-top:20px;">${ignore}</p>
    `,
  });
}

export const emailTemplates = {
  securityCode: {
    subject: `Your ${appName} security code`,
    html: (code) =>
      renderCodeEmail(code, {
        intro: `Here is your security code:`,
        ignore: `If you did not request this code, please ignore this email.`,
      }),
  },
  emailChangeCode: {
    subject: `Confirm your new email — ${appName}`,
    html: (code) =>
      renderCodeEmail(code, {
        intro: `You requested to change your email address. Enter the code below to confirm:`,
        ignore: `If you did not request this change, please ignore this email and your email address will remain unchanged.`,
      }),
  },
  resetPassword: {
    subject: `Reset your ${appName} password`,
    html: (code) =>
      renderCodeEmail(code, {
        intro: `You requested to reset your password. Use the code below to proceed:`,
        ignore: `If you did not request a password reset, please ignore this email. Your password will not be changed.`,
      }),
  },
  contact: {
    subject: (data) => `New contact message from ${data.name}`,
    html: (data) =>
      renderEmail({
        rights,
        title: `${appName} — Contact`,
        content: `
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap;">${data.message}</p>
    `,
      }),
  },
};
