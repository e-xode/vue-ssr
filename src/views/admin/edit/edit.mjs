import { mapGetters, mapMutations } from 'vuex'
import * as R from 'ramda'
import { collections } from '#src/shared/model'
import metas from '#src/mixins/metas'
import ComponentEditor from '#src/components/editor/editor.vue'

export default {
    name: 'ViewAdminEdit',
    mixins: [metas],
    beforeUnmount() {
        this.$socket.off('data.collection.item.created')
        this.$socket.off('data.collection.item.deleted')
        this.$socket.off('data.collection.item')
        this.$socket.off('data.collection')
    },
    created() {
        this.onMetas()
    },
    mounted() {
        const {
            collection: { name, store },
            locale,
            $route: { params: { _id }}
        } = this
        this.$socket.on('data.collection', ({ items, name = [], status }) => {
            this.endLoading()
            if (status === 200) {
                const { store } = collections.find((c) => c.name === name)
                this[store.setItems](items)
            }
        })
        this.$socket.on('data.collection.item', ({ item, name, status }) => {
            this.endLoading()
            if (status === 200) {
                const { store } = collections.find((c) => c.name === name)
                this[store.setItem](item)
                this.form = { ...item }
                this.onMetas()
            }
        })
        this.$socket.on('data.collection.item.deleted', () => {
            this.$router.push({
                name: 'ViewAdmin',
                params: {
                    locale,
                    collection: name
                }
            })
        })
        this.$socket.on('data.collection.item.created', () => {
            this.endLoading()
            this.$router.push({
                name: 'ViewAdmin',
                params: {
                    locale,
                    collection: name
                }
            })
        })
        if (_id) {
            this[store.setItem](null)
            if (_id !== 'new') {
                this.startLoading()
                this.$socket.emit('data.collection.item', {
                    collection: name,
                    name,
                    params: { _id }
                })
            }
        }
        const fields = this.collection.model.filter((field) => field.collection)
        fields.forEach(({ collection }) => {
            const { name, params, query }  = collections.find((c) => c.name == collection)
            this.startLoading()
            this.$socket.emit('data.collection', {
                collection: name,
                name,
                params,
                query,
                type: 'findAll'
            })
        })
    },
    watch: {
        '$route.params'({ _id, collection }) {
            if (_id) {
                const { store, name } = this.collection
                this[store.setItem](null)
                this.form = {}
                if (_id !== 'new') {
                    this.$socket.emit('data.collection.item', {
                        collection,
                        name,
                        params: { _id }
                    })
                }
            }
        }
    },
    data() {
        return {
            form: {},
            nav: null,
            timeout: null
        }
    },
    computed: {
        ...mapGetters('context', ['isLoading']),
        ...collections.reduce((getters, item) => ({
            ...getters,
            ...mapGetters(item.store.name, [
                item.store.getItem,
                item.store.getItems
            ])
        }), {}),
        collection () {
            const { collection } = this.$route.params
            return collections.find(({ name }) => name === collection)
        },
        fields () {
            return this.collection.model.filter((m) => m.editable)
        },
        locale () {
            return this.$i18n.locale
        },
        navItems () {
            return [
                {
                    label: this.$t('page.admin.h1'),
                    route: {
                        name: 'ViewAdmin'
                    }
                },
                {
                    label: this.collection.label,
                    value: this.collection.name,
                    route: {
                        name: 'ViewAdmin',
                        params: {
                            locale: this.$route.params.locale,
                            collection: this.collection.name
                        }
                    }
                },
                {
                    label: this.form._id
                }
            ]
        }
    },
    methods: {
        ...mapMutations('context', ['endLoading', 'startLoading']),
        ...collections.reduce((setters, item) => ({
            ...setters,
            ...mapMutations(item.store.name, [
                item.store.setItem,
                item.store.setItems
            ])
        }), {}),
        getOptions (name) {
            const collection = collections.find((c) => c.name === name)
            return !collection
                ? []
                : R.pipe(
                    R.uniqBy(R.prop('_id'))
                  )([
                    ...this[collection.store.getItems],
                    ...(this.form[name]
                        ? [this.form[name]]
                        : []
                    )
                ])
        },
        onChange(name, value) {
            this.form[name] = value
        },
        onDelete () {
            const { collection } = this.$route.params
            const { form } = this
            this.$socket.emit('data.collection.item', {
                form,
                collection,
                method: 'DELETE'
            })
        },
        onKeywordFilter ({ target }, collection) {
            clearTimeout(this.timeout)
            this.timeout = setTimeout(() => {
                this.$socket.emit('data.collection', {
                    collection,
                    params: {
                        field: 'name',
                        keyword: target?.value
                    },
                    type: 'findAll'
                })
            }, 500)
        },
        onFileChange (e) {
            const files = e.target.files || e.dataTransfer.files
            this.form.files = Array.from(files).map((file) => ({
                name: file.name,
                type: file.type,
                file
            }))
        },
        onMetas () {
            const item = this[this.collection.store.getItem]
            this.onMetasChange({
                description: '',
                image: '',
                keywords: '',
                title: this.$t('page.admin.edit.metas.title', {
                    category: this.collection.name,
                    name: item?.name
                })
            })
        },
        onSubmit () {
            const { collection } = this.$route.params
            const { form } = this
            const method = this.form._id
                ? 'UPDATE'
                : 'CREATE'
            this.startLoading()
            this.$socket.emit('data.collection.item', {
                collection,
                name: collection,
                form,
                method
            })
        }
    },
    components: {
        ComponentEditor
    }
}
