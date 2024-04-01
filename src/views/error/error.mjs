import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
    name: 'ViewError',
    beforeUnmount() {

    },
    created() {
        this.setDescription(this.$t('page.error.metas.description'))
        this.setKeywords(this.$t('page.error.metas.keywords'))
        this.setTitle(this.$t('page.error.metas.title'))
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
        ...mapMutations('metas', ['setDescription', 'setKeywords', 'setTitle']),
    }
}
