const state = {
    country: {},
    countries: [],
    paging: {
        offset: 0,
        max: 25,
        total: 0
    }
}
const getters = {
    getCountry ({ country }) {
        return country
    },
    getCountries ({ countries }) {
        return countries
    },
    getCountriesPaging ({ paging }) {
        return paging
    }
}

const mutations = {
    setCountry (state, payload) {
        state.country = payload
    },
    setCountries (state, payload) {
        state.countries = payload
    },
    setCountriesPaging(state, payload) {
        state.paging = payload
    }
}

const actions = {
    setCountriesPaginated ({ commit }, { items = [], paging = {} }) {
        commit('setCountries', items)
        commit('setCountriesPaging', paging)
    }
}

export default {
    actions,
    getters,
    mutations,
    namespaced: true,
    state
}
