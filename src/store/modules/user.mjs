const state = {
    _id: null,
    email: null,
    url: null
}
const getters = {
    email ({ email }) {
        return email
    },
    _id ({ _id }) {
        return _id
    }
}

const mutations = {
    setEmail (state, email) {
        state.email = email
    },
    setId (state, _id) {
        state._id = _id
    }
}

const actions = {
    auth ({ commit }, { email, _id }) {
        commit('setEmail', email)
        commit('setId', _id)
    }
}

export default {
    actions,
    getters,
    mutations,
    namespaced: true,
    state
}
