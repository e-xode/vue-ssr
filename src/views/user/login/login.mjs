import { mapActions, mapMutations } from 'vuex'
import dayjs from 'dayjs'

export default {
    name: 'ViewLogin',
    beforeUnmount() {
        this.$socket.off('user.captcha')
        this.$socket.off('user.auth')
    },
    created() {
        this.setDescription(this.$t('page.login.metas.description'))
        this.setKeywords(this.$t('page.login.metas.keywords'))
        this.setTitle(this.$t('page.login.metas.title'))
    },
    mounted() {
        this.$socket.on('user.auth', (user) => {
            switch (user.status) {
                case 100:
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
                email: null,
                password: null
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
            this.$socket.emit('user.login', {
                ...this.form,
                route: this.$route.query.route
            })
        }
    }
}
