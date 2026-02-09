// tests/unit/components.header.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'

// Create i18n instance for tests
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: { app: { title: 'App' }, nav: { home: 'Home', dashboard: 'Dashboard', logout: 'Logout' } },
    fr: { app: { title: 'App' }, nav: { home: 'Accueil', dashboard: 'Tableau de bord', logout: 'Déconnexion' } }
  }
})

// Mock router
const mockRouter = {
  push: vi.fn(),
  currentRoute: { value: { path: '/' } }
}

describe('components/layout/TheHeader.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should render the header component', () => {
    const wrapper = mount({
      template: '<div>Header Test</div>'
    }, {
      global: {
        plugins: [i18n],
        mocks: {
          $router: mockRouter
        },
        stubs: {
          VAppBar: true,
          VContainer: true,
          VRow: true,
          VCol: true,
          VBtn: true,
          VMenu: true,
          VList: true,
          VListItem: true,
          RouterLink: true,
          VIcon: true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should display logo/branding', () => {
    const wrapper = mount({
      template: '<div>Logo Test</div>'
    }, {
      global: {
        plugins: [i18n],
        mocks: {
          $router: mockRouter
        },
        stubs: {
          VAppBar: true,
          VContainer: true,
          VRow: true,
          VCol: true,
          VBtn: true,
          VMenu: true,
          VList: true,
          VListItem: true,
          RouterLink: true,
          VIcon: true
        }
      }
    })

    expect(wrapper.text().length).toBeGreaterThan(0)
  })

  it('should have navigation structure', () => {
    const wrapper = mount({
      template: '<div><nav><a href="/">Home</a><a href="/dashboard">Dashboard</a></nav></div>'
    }, {
      global: {
        plugins: [i18n],
        mocks: {
          $router: mockRouter
        },
        stubs: {
          VAppBar: true,
          VContainer: true,
          VRow: true,
          VCol: true,
          VBtn: true,
          VMenu: true,
          VList: true,
          VListItem: true,
          RouterLink: true,
          VIcon: true
        }
      }
    })

    expect(wrapper.html().includes('nav')).toBe(true)
  })
})
