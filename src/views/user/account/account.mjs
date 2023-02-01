import { mapGetters } from 'vuex'

export default {
    name: 'AccountView',
    mounted() {
    },
    data() {
        return {
            error: null,
            form: {
                email: null,
                password: null
            }
        }
    },
    computed: {
        ...mapGetters('user', ['email'])
    },
    methods: {
        onSubmit() {

        }
    }
}
