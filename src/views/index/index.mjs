import { mapActions } from 'vuex'
import { pages } from '#src/shared/page'
import mixinMetas from '#src/mixins/metas'
import mixinCollections from '#src/mixins/collections'

import ComponentCategories from '@/components/categories/categories.vue'

export default {
    name: 'ViewIndex',
    mixins: [
        mixinCollections,
        mixinMetas
    ],
    watch: {
        '$route.query.category'() {
            this.queries()
        }
    },
    data() {
        return {
        }
    },
    computed: {
        items () {
            return this[this.collection.store.getItems]
        },
        page () {
            return pages.find((p) => p.route.name === 'ViewIndex')
        }
    },
    methods: {
        ...mapActions('metas', ['setMetas']),
        onMetas () {
            const { description, keywords, title } = this.page.metas
            this.onMetasChange({
                description: this.$t(description),
                image: this.items[0]?.files?.[0]?.path,
                keywords: this.$t(keywords),
                title: this.$t(title)
            })
        }
    },
    components: {
        ComponentCategories
    }
}
