const state = {
    user: {},
    users: [],
    paging: {
        offset: 0,
        max: 25,
        total: 0
    }
}
const getters = {
    getUser ({ user }) {
        return user
    },
    getUsers ({ users }) {
        return users
    },
    getUsersPaging ({ paging }) {
        return paging
    }
}

const mutations = {
    setUser (state, payload) {
        state.user = payload
    },
    setUsers (state, payload) {
        state.users = payload
    },
    setUsersPaging(state, payload) {
        state.paging = payload
    }
}

const actions = {
    setUsersPaginated ({ commit }, { items = [], paging = {} }) {
        commit('setUsers', items)
        commit('setUsersPaging', paging)
    }
}

export default {
    actions,
    getters,
    mutations,
    namespaced: true,
    state
}
