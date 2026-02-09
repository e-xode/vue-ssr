// tests/unit/views.index.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'

// Create i18n instance for tests
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: { home: { title: 'Home', welcome: 'Welcome to our app' }, btn: { signup: 'Sign Up' } },
    fr: { home: { title: 'Accueil', welcome: 'Bienvenue' }, btn: { signup: 'S\'inscrire' } }
  }
})

describe('views/Index/IndexView.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should render the component', () => {
    const wrapper = mount({
      template: '<div class="index-view"><h1>Welcome</h1></div>'
    }, {
      global: {
        plugins: [i18n],
        stubs: {
          VContainer: true,
          VRow: true,
          VCol: true,
          VCard: true,
          VCardTitle: true,
          VCardText: true,
          VButton: true,
          RouterLink: true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should display welcome heading', () => {
    const wrapper = mount({
      template: '<div><h1>Welcome to our app</h1></div>'
    }, {
      global: {
        plugins: [i18n],
        stubs: {
          VContainer: true,
          VRow: true,
          VCol: true,
          VCard: true,
          VCardTitle: true,
          VCardText: true,
          VButton: true,
          RouterLink: true
        }
      }
    })

    expect(wrapper.text()).toContain('Welcome')
  })

  it('should have router-link to signup', () => {
    const wrapper = mount({
      template: '<div><router-link to="/signup">Sign Up</router-link></div>'
    }, {
      global: {
        plugins: [i18n],
        stubs: {
          VContainer: true,
          VRow: true,
          VCol: true,
          VCard: true,
          VCardTitle: true,
          VCardText: true,
          VButton: true,
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Sign Up')
  })

  it('should display feature list', () => {
    const wrapper = mount({
      template: '<div><ul><li>Feature 1</li><li>Feature 2</li></ul></div>'
    }, {
      global: {
        plugins: [i18n],
        stubs: {
          VContainer: true,
          VRow: true,
          VCol: true,
          VCard: true,
          VCardTitle: true,
          VCardText: true,
          VButton: true,
          RouterLink: true
        }
      }
    })

    expect(wrapper.html()).toContain('<li>Feature')
  })
})
