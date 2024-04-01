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
        name: 'ViewBase',
        component: () => import('@/views/layout/layout.vue'),
        children: [
            {
                component: () => import(
                    '@/views/user/account/account.vue'
                ),
                name: 'ViewAccount',
                path: ':locale/account'
            },
            {
                component: () => import(
                    '@/views/admin/admin.vue'
                ),
                name: 'ViewAdmin',
                path: ':locale/admin/:collection?',
            },
            {
                component: () => import(
                    '@/views/admin/edit/edit.vue'
                ),
                name: 'ViewAdminEdit',
                path: ':locale/admin/:collection/:_id',
            },
            {
                component: () => import(
                    '@/views/user/auth/auth.vue'
                ),
                name: 'ViewAuth',
                path: ':locale/auth'
            },
            {
                component: () => import(
                    '@/views/error/error.vue'
                ),
                name: 'ViewError',
                path: ':locale/error'
            },
            {
                component: () => import(
                    '@/views/item/item.vue'
                ),
                name: 'ViewItem',
                path: ':locale/:collection/:slug?',
            },
            {
                component: () => import(
                    '@/views/user/login/login.vue'
                ),
                name: 'ViewLogin',
                path: ':locale/login'
            },
            {
                component: () => import(
                    '@/views/user/register/register.vue'
                ),
                name: 'ViewRegister',
                path: ':locale/register'
            },
            {
                component: () => import(
                    '@/views/user/reset/reset.vue'
                ),
                name: 'ViewReset',
                path: ':locale/reset'
            },
            {
                component: () => import(
                    '@/views/index/index.vue'
                ),
                name: 'ViewIndex',
                path: ':locale?'
            }
        ]
    }
]

const router = createRouter({
  history,
  routes
})

export {
    routes,
    router
}
