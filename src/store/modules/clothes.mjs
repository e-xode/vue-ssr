const state = {
    clothe: {},
    clothes: [],
    paging: {
        offset: 0,
        max: 25,
        total: 0
    }
}
const getters = {
    getClothe ({ clothe }) {
        return clothe
    },
    getClothes ({ clothes }) {
        return clothes
    },
    getClothesPaging ({ paging }) {
        return paging
    }
}

const mutations = {
    setClothe (state, payload) {
        state.clothe = payload
    },
    setClothes (state, payload) {
        state.clothes = payload
    },
    setClothesPaging (state, payload) {
        state.paging = payload
    }
}

const actions = {
    setClothesPaginated ({ commit }, { items = [], paging = {} }) {
        commit('setClothes', items)
        commit('setClothesPaging', paging)
    }
}

export default {
    actions,
    getters,
    mutations,
    namespaced: true,
    state
}
