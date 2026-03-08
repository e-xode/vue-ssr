import {
    createRouter,
    createMemoryHistory,
    createWebHistory
} from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { LOCALE_CODES, LOCALE_ROUTE_REGEX } from '@/shared/const'

const history = typeof window === 'undefined'
    ? createMemoryHistory()
    : createWebHistory()

const localeRoutes = [
    {
        path: '',
        name: 'Index',
        component: () => import('@/views/Index/IndexView.vue'),
        meta: {
            layout: 'public',
            title: 'meta.index.title',
            description: 'meta.index.description'
        }
    },
    {
        path: 'signup',
        name: 'Signup',
        component: () => import('@/views/Auth/SignupView.vue'),
        meta: {
            layout: 'minimal',
            guest: true,
            title: 'meta.signup.title',
            description: 'meta.signup.description',
            robots: 'noindex, follow'
        }
    },
    {
        path: 'signin',
        name: 'Signin',
        component: () => import('@/views/Auth/SigninView.vue'),
        meta: {
            layout: 'minimal',
            guest: true,
            title: 'meta.signin.title',
            description: 'meta.signin.description',
            robots: 'noindex, follow'
        }
    },
    {
        path: 'auth/verify-code',
        name: 'VerifyCode',
        component: () => import('@/views/Auth/VerifyCodeView.vue'),
        meta: {
            layout: 'minimal',
            robots: 'noindex, nofollow'
        }
    },
    {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/DashboardView.vue'),
        meta: {
            layout: 'app',
            requiresAuth: true,
            title: 'meta.dashboard.title',
            description: 'meta.dashboard.description',
            robots: 'noindex, nofollow'
        }
    },
    {
        path: 'admin',
        name: 'Admin',
        redirect: to => `/${to.params.locale}/admin/users`
    },
    {
        path: 'admin/users',
        name: 'AdminUsers',
        component: () => import('@/views/Admin/AdminUsersView.vue'),
        meta: {
            layout: 'app',
            requiresAuth: true,
            requiresAdmin: true,
            title: 'meta.admin.users.title',
            robots: 'noindex, nofollow'
        }
    },
    {
        path: 'admin/users/:userId',
        name: 'AdminUserDetail',
        component: () => import('@/views/Admin/AdminUserDetailView.vue'),
        meta: {
            layout: 'app',
            requiresAuth: true,
            requiresAdmin: true,
            title: 'meta.admin.userDetail.title',
            robots: 'noindex, nofollow'
        }
    },
    {
        path: 'admin/logs',
        name: 'AdminLogs',
        component: () => import('@/views/Admin/AdminLogsView.vue'),
        meta: {
            layout: 'app',
            requiresAuth: true,
            requiresAdmin: true,
            title: 'meta.admin.logs.title',
            robots: 'noindex, nofollow'
        }
    },
    {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: () => import('@/views/Auth/ForgotPasswordView.vue'),
        meta: {
            layout: 'minimal',
            guest: true,
            title: 'meta.forgotPassword.title',
            robots: 'noindex, nofollow'
        }
    },
    {
        path: 'reset-password',
        name: 'ResetPassword',
        component: () => import('@/views/Auth/ResetPasswordView.vue'),
        meta: {
            layout: 'minimal',
            guest: true,
            title: 'meta.resetPassword.title',
            robots: 'noindex, nofollow'
        }
    },
    {
        path: 'account',
        name: 'Account',
        component: () => import('@/views/Account/AccountView.vue'),
        meta: {
            layout: 'app',
            requiresAuth: true,
            title: 'meta.account.title',
            robots: 'noindex, nofollow'
        }
    },
    {
        path: 'contact',
        name: 'Contact',
        component: () => import('@/views/Contact/ContactView.vue'),
        meta: {
            layout: 'public',
            title: 'meta.contact.title',
            description: 'meta.contact.description'
        }
    }
]

const routes = [
    {
        path: `/:locale(${LOCALE_ROUTE_REGEX})`,
        children: localeRoutes
    },
    {
        path: '/',
        redirect: () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('locale')
                if (saved && LOCALE_CODES.includes(saved)) return `/${saved}`
                const browserLang = navigator.language?.slice(0, 2)
                if (LOCALE_CODES.includes(browserLang)) return `/${browserLang}`
            }
            return '/en'
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound/NotFoundView.vue'),
        meta: {
            layout: 'minimal',
            title: 'meta.notFound.title',
            robots: 'noindex, follow',
            statusCode: 404
        }
    }
]

export const router = createRouter({
    history,
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        return { top: 0 }
    }
})

router.beforeEach(async (to) => {
    if (typeof window === 'undefined') return true

    const locale = to.params.locale
    if (locale) {
        localStorage.setItem('locale', locale)
    }

    const authStore = useAuthStore()

    if (!authStore.user && !authStore.loading) {
        await authStore.fetchUser()
    }

    if (to.meta.guest && authStore.isAuthenticated) {
        return { name: 'Dashboard', params: { locale: locale || 'en' } }
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return { name: 'Signin', params: { locale: locale || 'en' } }
    }

    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        return { name: 'Dashboard', params: { locale: locale || 'en' } }
    }

    return true
})
