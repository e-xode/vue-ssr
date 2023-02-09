export default {
    name: 'ViewIndex',
    created() {
        const { commit } = this.$store
        commit('metas/setDescription', this.$t('page.index.metas.description'))
        commit('metas/setKeywords', this.$t('page.index.metas.keywords'))
        commit('metas/setTitle', this.$t('page.index.metas.title'))
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
    }
}
