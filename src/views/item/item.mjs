import { mapGetters, mapMutations } from 'vuex'
import { pages } from '#src/shared/page'
import mixinMetas from '#src/mixins/metas'
import mixinCollections from '#src/mixins/collections'
import ComponentCategories from '@/components/categories/categories.vue'

export default {
    name: 'ViewItem',
    mixins: [
        mixinCollections,
        mixinMetas
    ],
    beforeUnmount() {
        this.$socket.off('user.get.orders')
        this.$socket.off('user.new.order')
    },
    mounted() {
        this.$socket.on('user.get.orders', ({ orders, status }) => {
            if (status == 200) {
                this.setOrders(orders)
            }
        })
        this.$socket.on('user.new.order', ({ error, status }) => {
            this.orderError = error
            this.orderStatus = status
        })
        this.$socket.emit(
            'user.get.orders',
            { slug: this.$route.params.slug }
        )
    },
    data() {
        return {
            orderError: null,
            orderStatus: null
        }
    },
    computed: {
        ...mapGetters('user', ['user']),
        fb () {
            const { collection, item: { slug } = { slug: ''}, locale } = this
            const path = `${locale}/${collection.name}/${slug}`
            const link =  `https://ssr.e-xode.net/${path}`
            const u = `${encodeURI(link)}`
            const t = `${encodeURI(this.metas.title)}`
            return `https://www.facebook.com/sharer/sharer.php?u=${u}&t=${t}`
        },
        hasOrderInProgress () {
            if (this.item?._id) {
                const { orders = [] } = this.user
                return orders.find(({ item, status }) => {
                    return item._id.toString() === this.item._id.toString() && status === 'pending'
                })
            }
            return false
        },
        item () {
            return this.collection?.store
                ? this[this.collection.store.getItem]
                : {}
        },
        nav () {
            const index = [{
                label: this.$t('component.header.home'),
                value: 'home',
                route: { name: 'ViewIndex' }
            }]
            return !this.item?._id
                ? index
                : [
                    ...index,
                    {
                        label: this.item.category.name,
                        value: this.item.category.name,
                        route: {
                            name: 'ViewIndex',
                            query: { category: this.item.category.name }
                        }
                    },
                    {
                        label: this.item.name,
                        value: this.item.name,
                        disabled: true
                    }
                ]
        },
        page () {
            return pages.find((p) => p.route.name === 'ViewItem')
        }
    },
    methods: {
        ...mapMutations('user', ['setOrders']),
        onOrder () {
            this.$socket.emit('user.new.order', {
                ...this.item,
                collection: this.collection.name
            })
        },
        onMetas () {
            const { item } = this
            if (item?._id) {
                this.onMetasChange({
                    description: '',
                    image: item.files?.[0]?.path,
                    keywords: '',
                    title: `${item.name} ${this.$t('component.header.home')}`
                })
            }
        }
    },
    components: {
        ComponentCategories
    }
}
