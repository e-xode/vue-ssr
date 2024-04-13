import { mapActions, mapGetters, mapMutations } from 'vuex'
import { collections } from '#src/shared/model'

export default {
    beforeUnmount() {
        this.$socket.off('data.collection')
        this.$socket.off('data.collection.item')
    },
    mounted () {
        this.$socket.on('data.collection', (data) => {
            this.status[data.name] = data.status
            if (this.status[data.name] === 200) {
                const collection = this.page.queries.find((q) => q.name === data.name)
                this[collection.store.setItemsPaginated](data)
                this.onMetas()
            }
            this.endLoading()
        })
        this.$socket.on('data.collection.item', ({ item, name, status }) => {
            this.status[name] = status
            if (this.status[name] === 200) {
                const collection = this.page.queries.find((q) => q.name === name)
                this[collection.store.setItem](item)
                this.onMetas()
            }
            this.endLoading()
        })
        this.queries()
    },
    data() {
        return {
            status: {}
        }
    },
    computed: {
        ...mapGetters('context', ['isLoading']),
        ...collections.reduce((getters, collection) => ({
            ...getters,
            ...mapGetters(collection.store.name, [
                collection.store.getItem,
                collection.store.getItems,
                collection.store.getItemsPaging
            ])
        }), {}),
        collection () {
            const query = this.page.queries.find((c) => c.default)
            return collections.find((c) => c.name === query.name)
        },
        locale () {
            return this.$i18n.locale
        }
    },
    methods: {
        ...mapMutations('context', ['endLoading', 'startLoading']),
        ...collections.reduce((setters, collection) => ({
            ...setters,
            ...mapActions(collection.store.name, [
                collection.store.setItemsPaginated
            ]),
            ...mapMutations(collection.store.name, [
                collection.store.setItem
            ])
        }), {}),
        queries () {
            const { max = 25, offset = 0 } = this.$route.query
            this.page.queries.forEach((query) => {
                this.startLoading()
                const type = query.type === 'findOne'
                    ? 'data.collection.item'
                    : 'data.collection'
                this.$socket.emit(type, {
                    ...query,
                    query: { ...this.$route.query, max, offset },
                    params: { ...this.$route.params }
                })
            })
        }
    }
}
