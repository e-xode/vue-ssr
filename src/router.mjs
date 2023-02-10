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
        name: "layout",
        component: () => import('@/views/layout/layout.vue'),
        children: [
            {
                component: () => import(
                    '@/views/user/account/account.vue'
                ),
                name: 'ViewAccount',
                path: 'account'
            },
            {
                component: () => import(
                    '@/views/user/auth/auth.vue'
                ),
                name: 'ViewAuth',
                path: 'auth'
            },
            {
                component: () => import(
                    '@/views/user/login/login.vue'
                ),
                name: 'ViewLogin',
                path: 'login'
            },
            {
                component: () => import(
                    '@/views/user/register/register.vue'
                ),
                name: 'ViewRegister',
                path: 'register'
            },
            {
                component: () => import(
                    '@/views/index/index.vue'
                ),
                name: 'ViewIndex',
                path: ''
            }
        ]
    }
]

const router = createRouter({
  history,
  routes,
})

export {
    routes,
    router
}
