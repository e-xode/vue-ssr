const state = {
    post: {},
    posts: [],
    paging: {
        offset: 0,
        max: 25,
        total: 0
    }
}
const getters = {
    getPost ({ post }) {
        return post
    },
    getPosts ({ posts }) {
        return posts
    },
    getPostsPaging ({ paging }) {
        return paging
    }
}

const mutations = {
    setPost (state, payload) {
        state.post = payload
    },
    setPosts (state, payload) {
        state.posts = payload
    },
    setPostsPaging (state, payload) {
        state.paging = payload
    },
}

const actions = {
    setPostsPaginated ({ commit }, { items = [], paging }) {
        commit('setPosts', items)
        commit('setPostsPaging', paging)
    }
}

export default {
    actions,
    getters,
    mutations,
    namespaced: true,
    state
}
