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
