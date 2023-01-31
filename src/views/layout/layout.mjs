import { mapActions, mapGetters } from 'vuex'

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
    methods: {
        ...mapActions('user', ['auth']),
        onDropdown ({ value }) {
            switch (value) {
                case 'logout':
                    return this.logout()
            }
        },
        logout () {
            this.auth({ _id: null, email: null })
            this.$router.push({ name: 'ViewLogin' })
        }
    }
}
