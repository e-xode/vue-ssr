const isProduction = process.env.NODE_ENV === 'production'

export async function verifyCaptcha(token, expectedAction) {
  if (!isProduction) return { success: true, score: 1.0 }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  if (!secretKey) return { success: true, score: 1.0 }

  if (!token) return { success: false, reason: 'missing' }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`
    })

    const data = await response.json()

    if (!data.success) return { success: false, reason: 'invalid' }
    if (expectedAction && data.action !== expectedAction) return { success: false, reason: 'action_mismatch' }

    const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE) || 0.5
    if (data.score < minScore) return { success: false, reason: 'low_score', score: data.score }

    return { success: true, score: data.score }
  } catch (err) {
    console.error('reCAPTCHA verification error:', err)
    return { success: true, score: 0 }
  }
}
