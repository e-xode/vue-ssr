import { mapMutations } from 'vuex'

export default {
    name: 'ViewIndex',
    created() {
        this.setDescription(this.$t('page.index.metas.description'))
        this.setKeywords(this.$t('page.index.metas.keywords'))
        this.setTitle(this.$t('page.index.metas.title'))
    },
    mounted() {
    },
    data() {
        return {
        }
    },
    computed: {
    },
    methods: {
        ...mapMutations('metas', ['setDescription', 'setKeywords', 'setTitle'])
    }
}
