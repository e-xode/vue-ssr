import { createStore } from 'vuex'
import categories from '@/store/modules/categories.mjs'
import clothes from '@/store/modules/clothes.mjs'
import context from '@/store/modules/context.mjs'
import countries from '@/store/modules/countries.mjs'
import logs from '@/store/modules/logs.mjs'
import metas from '@/store/modules/metas.mjs'
import orders from '@/store/modules/orders.mjs'
import posts from '@/store/modules/posts.mjs'
import user from '@/store/modules/user.mjs'
import users from '@/store/modules/users.mjs'

const store = createStore({
    modules: {
        categories,
        clothes,
        context,
        countries,
        logs,
        metas,
        orders,
        posts,
        user,
        users
    },
    plugins: []
})

export default store
