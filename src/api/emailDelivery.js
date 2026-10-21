export async function deliverEmail(res, sending) {
  const result = await sending;
  if (result?.success) return true;
  console.error('Email delivery failed:', result?.error);
  res.status(502).json({ error: 'error.emailFailed' });
  return false;
}
