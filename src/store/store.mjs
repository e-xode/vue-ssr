import { createStore } from 'vuex'
import user from '@/store/modules/user.mjs'

const store = createStore({
    modules: {
        user
    },
    plugins: []
})

export default store
