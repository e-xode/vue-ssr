import { mapActions, mapMutations } from 'vuex'
import { pages } from '#src/shared/page'
import mixinCollections from '#src/mixins/collections'
import mixinMetas from '#src/mixins/metas'

export default {
    name: 'ViewRegister',
    mixins: [
        mixinCollections,
        mixinMetas
    ],
    beforeUnmount() {
        this.$socket.off('user.captcha')
        this.$socket.off('user.auth')
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
            },
            timeout: null
        }
    },
    computed: {
        locale () {
            return this.$i18n.locale
        },
        page () {
            return pages.find((p) => p.route.name === 'ViewRegister')
        },
        svg () {
            return `data:image/svg+xml,${this.captcha}`
        }
    },
    methods: {
        ...mapActions('user', ['auth']),
        ...mapMutations('metas', ['setDescription', 'setKeywords', 'setTitle']),
        onCountryKeyword ({ target }) {
            clearTimeout(this.timeout)
            this.timeout = setTimeout(() => {
                this.$socket.emit('data.collection', {
                    collection: 'country',
                    name: 'country',
                    params: {
                        field: 'name',
                        keyword: target.value
                    },
                    type: 'findAll'
                })
            }, 500)
        },
        onMetas () {
            const { description, keywords, title } = this.page.metas
            this.onMetasChange({
                description: this.$t(description),
                image: null,
                keywords: this.$t(keywords),
                title: this.$t(title)
            })
        },
        onSubmit () {
            this.error = null
            this.$socket.emit('user.register', {
                ...this.form,
                route: this.$route.query.route
            })
        }
    },
    components: {
    }
}
