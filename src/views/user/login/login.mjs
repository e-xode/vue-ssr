import { mapActions, mapMutations } from 'vuex'

export default {
    name: 'ViewLogin',
    beforeUnmount() {
        this.$socket.off('captcha')
        this.$socket.off('auth')
    },
    created() {
        this.setDescription(this.$t('page.login.metas.description'))
        this.setKeywords(this.$t('page.login.metas.keywords'))
        this.setTitle(this.$t('page.login.metas.title'))
    },
    mounted() {
        this.$socket.on('captcha', (data) => {
            this.captcha = data
        })
        this.$socket.on('auth', ({ _id, email, error, status }) => {
            switch (status) {
                case 200:
                    this.auth({ _id, email })
                    this.$router.push({ name: 'ViewAuth' })
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
        ...mapMutations('metas', ['setDescription', 'setKeywords', 'setTitle']),
        login () {
            this.$socket.emit('login', this.form)
        }
    },
    components: {
    }
}
