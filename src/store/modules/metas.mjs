const state = {
    metas: {
        description: null,
        image: null,
        keywords: null,
        title: null
    }
}
const getters = {
    metas ({ metas }) {
        return metas
    }
}

const mutations = {
    setDescription (state, description) {
        state.metas.description = description
    },
    setImage (state, image) {
        state.metas.image = image
    },
    setKeywords(state, keywords) {
        state.metas.keywords = keywords
    },
    setMetas (state, metas) {
        state.metas = metas
    },
    setTitle (state, title) {
        state.metas.title = title
    }
}

const actions = {
    setMetas ({ commit }, metas) {
        commit('setMetas', metas)
    }
}

export default {
    actions,
    getters,
    mutations,
    namespaced: true,
    state
}
