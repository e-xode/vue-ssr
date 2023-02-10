import { mapActions, mapGetters } from 'vuex'

export default {
    name: 'DefaultLayout',
    beforeUnmount() {
        this.$socket.off('me')
    },
    mounted() {
        this.$socket.on('me', ({ _id, email}) => {
            this.auth({
                _id,
                email
            })
        })
        this.$socket.emit('me')
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
                case 'account':
                    return this.$router.push({ name: 'ViewAccount' })
                case 'logout':
                    return this.logout()
            }
        },
        logout () {
            this.$socket.emit('logout')
            this.auth({ _id: null, email: null })
            this.$router.push({ name: 'ViewLogin' })
        }
    }
}
