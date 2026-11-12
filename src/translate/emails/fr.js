import { appName, codeExpiryMinutes, renderCodeBox, renderEmail } from './layout.js';

const rights = 'Tous droits réservés.';
const expiryText = `Ce code expire dans ${codeExpiryMinutes} minutes`;

function renderCodeEmail(code, { intro, ignore }) {
  return renderEmail({
    rights,
    content: `
      <p>Bonjour,</p>
      <p>${intro}</p>
      ${renderCodeBox(code, expiryText)}
      <p style="margin-top:20px;">${ignore}</p>
    `,
  });
}

export const emailTemplates = {
  securityCode: {
    subject: `Votre code de sécurité ${appName}`,
    html: (code) =>
      renderCodeEmail(code, {
        intro: `Voici votre code de sécurité :`,
        ignore: `Si vous n'avez pas demandé ce code, veuillez ignorer cet email.`,
      }),
  },
  emailChangeCode: {
    subject: `Confirmez votre nouvel email — ${appName}`,
    html: (code) =>
      renderCodeEmail(code, {
        intro: `Vous avez demandé à changer votre adresse email. Entrez le code ci-dessous pour confirmer :`,
        ignore: `Si vous n'avez pas demandé ce changement, ignorez cet email. Votre adresse email restera inchangée.`,
      }),
  },
  resetPassword: {
    subject: `Réinitialisation de votre mot de passe ${appName}`,
    html: (code) =>
      renderCodeEmail(code, {
        intro: `Vous avez demandé à réinitialiser votre mot de passe. Utilisez le code ci-dessous :`,
        ignore: `Si vous n'avez pas demandé de réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.`,
      }),
  },
  contact: {
    subject: (data) => `Nouveau message de contact de ${data.name}`,
    html: (data) =>
      renderEmail({
        rights,
        title: `${appName} — Contact`,
        content: `
      <p><strong>Nom :</strong> ${data.name}</p>
      <p><strong>Email :</strong> ${data.email}</p>
      <p><strong>Message :</strong></p>
      <p style="white-space:pre-wrap;">${data.message}</p>
    `,
      }),
  },
};
