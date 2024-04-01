const state = {
    log: {},
    logs: [],
    paging: {
        offset: 0,
        max: 25,
        total: 0
    }
}

const getters = {
    getLog ({ log }) {
        return log
    },
    getLogs ({ logs }) {
        return logs
    },
    getLogsPaging ({ paging }) {
        return paging
    }
}

const mutations = {
    setLog (state, payload) {
        state.log = payload
    },
    setLogsPaging (state, payload) {
        state.paging = payload
    },
    setLogs (state, payload) {
        state.logs = payload
    }
}

const actions = {
    setLogsPaginated ({ commit }, { items = [], paging }) {
        commit('setLogs', items)
        commit('setLogsPaging', paging)
    }
}

export default {
    actions,
    getters,
    mutations,
    namespaced: true,
    state
}
