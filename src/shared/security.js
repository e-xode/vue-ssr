import fs from 'node:fs'
import path from 'node:path'

const LOGIN_HISTORY_MAX = 50

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.ip || req.socket?.remoteAddress || 'unknown'
}

export async function isIpBlocked(db, ip) {
  const blocked = await db.collection('blockedIps').findOne({ ip })
  return !!blocked
}

export async function recordLoginIp(db, userId, ip) {
  const entry = { ip, date: new Date() }

  await db.collection('users').updateOne(
    { _id: userId },
    {
      $push: {
        loginHistory: {
          $each: [entry],
          $slice: -LOGIN_HISTORY_MAX
        }
      }
    }
  )
}

export async function destroyUserSessions(userId, excludeSessionId = null) {
  const sessionsDir = 'logs/sessions'
  const userIdStr = userId.toString()

  let files
  try {
    files = await fs.promises.readdir(sessionsDir)
  } catch {
    return
  }

  for (const file of files) {
    if (!file.endsWith('.json')) continue
    if (excludeSessionId && file === `${excludeSessionId}.json`) continue
    try {
      const content = await fs.promises.readFile(path.join(sessionsDir, file), 'utf-8')
      const session = JSON.parse(content)
      if (session.userId === userIdStr) {
        await fs.promises.unlink(path.join(sessionsDir, file))
      }
    } catch {
      continue
    }
  }
}
