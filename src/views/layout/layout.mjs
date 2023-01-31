import { mapGetters } from 'vuex'

export default {
    name: 'DefaultLayout',
    mounted() {
    },
    data() {
        return {
        }
    },
    computed: {
        ...mapGetters('user', ['email'])
    },
    components: {
    }
}
