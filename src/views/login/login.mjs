import { mapActions } from 'vuex'

export default {
    name: 'LoginView',
    beforeUnmount() {
        this.$socket.off('captcha')
        this.$socket.off('login')
    },
    mounted() {
        this.$socket.on('captcha', (data) => {
            this.captcha = data
        })
        this.$socket.on('login', ({ _id, error, status }) => {
            switch (status) {
                case 200:
                    const { email } = this.form
                    this.auth({ _id, email })
                    this.$router.push({ name: 'index' })
                    break
                case 400:
                        this.error = error
                    break
            }
        })
        this.$socket.emit('captcha')
    },
    data() {
        return {
            captcha: null,
            error: null,
            form: {
                captcha: null,
                email: null,
                password: null
            }
        }
    },
    computed: {
    },
    methods: {
        ...mapActions('user', ['auth']),
        login () {
            this.$socket.emit('login', this.form)
        }
    },
    components: {
    }
}
