import {
    createRouter,
    createMemoryHistory,
    createWebHistory
} from 'vue-router'

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
    routes
})

router.beforeEach(async (to, from, next) => {
    // Auth guard could go here
    // For now, just continue
    next()
})
