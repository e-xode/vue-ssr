import categories from "../../components/categories/categories.mjs"

const state = {
    category: {},
    categories: [],
    paging: {
        offset: 0,
        max: 25,
        total: 0
    }
}

const getters = {
    getCategory ({ category }) {
        return category
    },
    getCategories ({ categories }) {
        return categories
    },
    getCategoriesPaging ({ paging }) {
        return paging
    }
}

const mutations = {
    setCategory (state, payload) {
        state.category = payload
    },
    setCategoriesPaging(state, payload) {
        state.paging = payload
    },
    setCategories (state, payload) {
        state.categories = payload
    }
}

const actions = {
    setCategoriesPaginated ({ commit }, { items = [], paging }) {
        commit('setCategories', items)
        commit('setCategoriesPaging', paging)
    }
}

export default {
    actions,
    getters,
    mutations,
    namespaced: true,
    state
}
