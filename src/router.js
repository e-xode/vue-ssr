import {
    createRouter,
    createMemoryHistory,
    createWebHistory
} from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const history = typeof window === 'undefined'
    ? createMemoryHistory()
    : createWebHistory()

const routes = [
    {
        path: '/',
        name: 'Index',
        component: () => import('@/views/Index/IndexView.vue'),
        meta: {
            layout: 'public',
            title: 'meta.index.title',
            description: 'meta.index.description'
        }
    },
    {
        path: '/signup',
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
        path: '/signin',
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
        path: '/auth/verify-code',
        name: 'VerifyCode',
        component: () => import('@/views/Auth/VerifyCodeView.vue'),
        meta: {
            layout: 'minimal',
            robots: 'noindex, nofollow'
        }
    },
    {
        path: '/dashboard',
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
        path: '/admin',
        name: 'Admin',
        redirect: '/admin/users'
    },
    {
        path: '/admin/users',
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
        path: '/admin/users/:userId',
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
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound/NotFoundView.vue'),
        meta: {
            layout: 'minimal',
            title: 'meta.notFound.title',
            robots: 'noindex, follow'
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

router.beforeEach(async (to, from, next) => {
    if (typeof window === 'undefined') return next()

    const authStore = useAuthStore()

    if (!authStore.user && !authStore.loading) {
        await authStore.fetchUser()
    }

    if (to.meta.guest && authStore.isAuthenticated) {
        return next({ name: 'Dashboard' })
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next({ name: 'Signin' })
    }

    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        return next({ name: 'Dashboard' })
    }

    next()
})
