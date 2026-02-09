export function setupSignoutRoute(app) {
  app.post('/api/auth/signout', async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'error.server' })
      }
      res.json({ status: 'success' })
    })
  })
}
