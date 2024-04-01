const state = {
    order: {},
    orders: [],
    paging: {
        offset: 0,
        max: 25,
        total: 0
    }
}
const getters = {
    getOrder ({ order }) {
        return order
    },
    getOrders ({ orders }) {
        return orders
    },
    getOrdersPaging ({ paging }) {
        return paging
    }
}

const mutations = {
    setOrder (state, payload) {
        state.order = payload
    },
    setOrders (state, payload) {
        state.orders = payload
    },
    setOrdersPaging (state, payload) {
        state.paging = payload
    }
}

const actions = {
    setOrdersPaginated ({ commit }, { items = [], paging = {} }) {
        commit('setOrders', items)
        commit('setOrdersPaging', paging)
    }
}

export default {
    actions,
    getters,
    mutations,
    namespaced: true,
    state
}
