function gtag(...args) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args)
  }
}

export function trackPageView(path, title) {
  gtag('event', 'page_view', { page_path: path, page_title: title })
}

export function trackEvent(eventName, params = {}) {
  gtag('event', eventName, params)
}

export function trackSignup(method = 'email') {
  gtag('event', 'sign_up', { method })
}

export function trackLogin(method = 'email') {
  gtag('event', 'login', { method })
}

export function trackContactForm() {
  gtag('event', 'generate_lead', { source: 'contact_form' })
}
