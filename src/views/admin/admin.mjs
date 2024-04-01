import { mapActions, mapGetters, mapMutations } from 'vuex'
import { collections } from '#src/shared/model'

export default {
    name: 'ViewAdmin',
    beforeUnmount() {
        this.$socket.off('data.collection')
    },
    created() {
        this.setDescription(this.$t('page.admin.metas.description'))
        this.setKeywords(this.$t('page.admin.metas.keywords'))
        this.setTitle(this.$t('page.admin.metas.title'))
    },
    mounted() {
        const { collection: { name, params, query } } = this
        this.$socket.on('data.collection', (data) => {
            this[this.collection.store.setItemsPaginated](data)
            this.endLoading()
        })
        this.startLoading()
        this.$socket.emit('data.collection', {
            collection: name,
            name,
            query,
            params,
            type: 'findAll'
        })
    },
    watch: {
        '$route.params.collection'() {
            const { collection: { name, params, query } } = this
            if (name) {
                this.startLoading()
                this.$socket.emit('data.collection', {
                    collection: name,
                    name,
                    query,
                    params,
                    type: 'findAll'
                })
            }
        }
    },
    data() {
        return {
            page: 1
        }
    },
    computed: {
        ...mapGetters('context', ['isLoading']),
        ...collections.reduce((getters, collection) => {
            return {
                ...getters,
                ...mapGetters(collection.store.name, [
                    collection.store.getItems,
                    collection.store.getItemsPaging
                ])
            }
        }, {}),
        collection () {
            return this.$route.params.collection
                ? this.collections.find((c) => c.name == this.$route.params.collection)
                : this.collections[0]
        },
        collections () {
            return collections.map((item) => ({
                ...item,
                route: {
                    name: 'ViewAdmin',
                    params: {
                        locale: this.locale,
                        collection: item.name
                    }
                }
            }))
        },
        items () {
            return this.collection?.store
                ? this[this.collection.store.getItems]
                : []
        },
        label () {
            return this.collection.model.find((m) => m.isLabel)
        },
        locale () {
            return this.$i18n.locale
        },
        paging () {
            return this.collection?.store
                ? this[this.collection.store.getItemsPaging]
                : {}
        },
        tableHeaders () {
            return this.collection.model
            .filter((item) => item.tableHeader)
            .map((item) => {
                if (item.collection) {
                    const nested = this.collections.find((c) => c.name === item.collection)
                    const field = nested.model.find((field) => field.isLabel)
                    return {
                        label: `${item.collection}`,
                        value: `${item.name}.${field.name}`
                    }
                }
                return {
                    label: item.name,
                    value: item.name
                }
            })
        }
    },
    methods: {
        ...mapMutations('context', ['endLoading', 'startLoading']),
        ...collections.reduce((setters, collection) => ({
            ...setters,
            ...mapActions(collection.store.name, [
                collection.store.setItemsPaginated
            ])
        }), {}),
        ...mapMutations('metas', [
            'setDescription',
            'setKeywords',
            'setTitle'
        ]),
        onPage (page) {
            if (page) {
                const { max } = this.paging
                const offset = max * ( page - 1)
                this.$socket.emit('data.collection', {
                    collection: this.collection.name,
                    name: this.collection.name,
                    query: {
                        offset,
                        max
                    },
                    type: 'findAll'
                })
            }
        }
    }
}
