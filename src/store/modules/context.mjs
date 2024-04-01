const state = {
    loading: 0
}
const getters = {
    isLoading ({ loading }) {
        return loading > 0
    }
}

const mutations = {
    startLoading (state) {
        state.loading++
    },
    endLoading (state) {
        state.loading--
    }
}

const actions = {
}

export default {
    actions,
    getters,
    mutations,
    namespaced: true,
    state
}
