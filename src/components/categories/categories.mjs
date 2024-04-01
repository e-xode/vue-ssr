import { mapGetters } from 'vuex'

export default {
    name: 'ComponentCategories',
    created() {
    },
    mounted() {
    },
    data() {
        return {
        }
    },
    computed: {
        ...mapGetters('categories', {
            categories: 'getCategories'
        }),
        locale () {
            return this.$i18n.locale
        }
    },
    methods: {
    }
}
