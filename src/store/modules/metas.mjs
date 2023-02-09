const state = {
    description: null,
    keywords: null,
    title: null
}
const getters = {
    get ({ description, keywords, title }) {
        return {
            description,
            keywords,
            title
        }
    }
}

const mutations = {
    setDescription (state, description) {
        state.description = description
    },
    setKeywords(state, keywords) {
        state.keywords = keywords
    },
    setTitle (state, title) {
        state.title = title
    }
}

const actions = {
    set ({ commit }, { description,  keywords, title }) {
        commit('setDescription', description)
        commit('setKeywords', keywords)
        commit('setTitle', title)
    }
}

export default {
    actions,
    getters,
    mutations,
    namespaced: true,
    state
}
