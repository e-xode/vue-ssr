const state = {
    locale: null,
    user: {
        email: null,
        error: null,
        isadmin: false,
        orders: [],
        status: null
    }
}
const getters = {
    email ({ user }) {
        return user.email
    },
    error ({ error }) {
        return error
    },
    isAdmin ({ user }) {
        return user?.isadmin
    },
    isAuthenticated({ user }) {
        return user?._id && user.status === 200
    },
    locale({ locale }) {
        return locale
    },
    orders({ user }) {
        return user.orders
    },
    status({ user }) {
        return user.status
    },
    user({ user }) {
        return user
    }
}

const mutations = {
    setEmail (state, email) {
        state.user.email = email
    },
    setError (state, error) {
        state.user.error = error
    },
    setIsAdmin (state, isadmin) {
        state.user.isadmin = isadmin
    },
    setLocale (state, locale) {
        state.locale = locale
    },
    setOrders (state, orders) {
        state.user.orders = orders
    },
    setStatus (state, status) {
        state.user.status = status
    },
    setUser (state, user) {
        state.user = user
    }
}
const actions = {
    auth ({ commit }, user) {
        commit('setUser', user)
    },
    logout ({ dispatch }) {
        dispatch('auth', {
            email: null,
            error: null,
            isadmin: false,
            orders: [],
            status: null
        })
    }
}

export default {
    actions,
    getters,
    mutations,
    namespaced: true,
    state
}
