import { mapActions, mapMutations } from 'vuex'

export default {
    name: 'ViewReset',
    beforeUnmount() {
        this.$socket.off('user.captcha')
        this.$socket.off('user.reset-password')
    },
    created() {
        this.setDescription(this.$t('page.login.metas.description'))
        this.setKeywords(this.$t('page.login.metas.keywords'))
        this.setTitle(this.$t('page.login.metas.title'))
    },
    mounted() {
        this.$socket.on('user.auth', (user) => {
            switch (user.status) {
                case 449:
                    this.auth(user)
                    this.$router.push({
                        name: 'ViewAuth',
                        params: {
                            locale: this.locale
                        }
                    })
                    break
                case 400:
                    this.error = user.error
                    break
            }
        })
        this.$socket.on('user.captcha', (data) => {
            this.captcha = data
        })
        this.$socket.emit('user.captcha')
    },
    data() {
        return {
            captcha: null,
            error: null,
            form: {
                captcha: null,
                email: null
            }
        }
    },
    computed: {
        locale () {
            return this.$i18n.locale
        },
        svg () {
            return `data:image/svg+xml,${this.captcha}`
        }
    },
    methods: {
        ...mapActions('user', ['auth']),
        ...mapMutations('metas', ['setDescription', 'setKeywords', 'setTitle']),
        onSubmit () {
            this.error = null
            this.$socket.emit('user.reset-password', {
                ...this.form,
                route: 'account'
            })
        }
    }
}
