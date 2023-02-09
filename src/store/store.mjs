import { createStore } from 'vuex'
import metas from '@/store/modules/metas.mjs'
import user from '@/store/modules/user.mjs'

const store = createStore({
    modules: {
        metas,
        user
    },
    plugins: []
})

export default store
