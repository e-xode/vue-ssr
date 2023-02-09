import { mapActions } from 'vuex'

export default {
    name: 'LoginView',
    beforeUnmount() {
        this.$socket.off('captcha')
        this.$socket.off('login')
    },
    created() {
        const { commit } = this.$store
        commit('metas/setDescription', this.$t('page.login.metas.description'))
        commit('metas/setKeywords', this.$t('page.login.metas.keywords'))
        commit('metas/setTitle', this.$t('page.login.metas.title'))
    },
    mounted() {
        this.$socket.on('captcha', (data) => {
            this.captcha = data
        })
        this.$socket.on('login', ({ _id, email, error, status }) => {
            switch (status) {
                case 200:
                    this.auth({ _id, email })
                    this.$router.push({ name: 'ViewIndex' })
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
        svg () {
            return `data:image/svg+xml,${this.captcha}`
        }
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
