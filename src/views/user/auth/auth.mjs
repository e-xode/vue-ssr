import { mapActions, mapMutations } from 'vuex'

export default {
    name: 'ViewAuth',
    beforeUnmount() {
        this.$socket.off('user.auth')
    },
    created() {
        this.setDescription(this.$t('page.auth.metas.description'))
        this.setKeywords(this.$t('page.auth.metas.keywords'))
        this.setTitle(this.$t('page.auth.metas.title'))
    },
    mounted() {
        this.$socket.on('user.auth', (user) => {
            switch (user.status) {
                case 200:
                case 449:
                    this.auth(user)
                    if(user.route) {
                        this.$router.push(user.route)
                    } else {
                        this.$router.push({
                            name: 'ViewIndex',
                            params: {
                                locale: this.$i18n.locale
                            }
                        })
                    }
                    break
                case 400:
                    this.error = user.error
                    break
            }
        })
    },
    data() {
        return {
            error: null,
            form: {
                code: null
            }
        }
    },
    computed: {
    },
    methods: {
        ...mapActions('user', ['auth']),
        ...mapMutations('metas', ['setDescription', 'setKeywords', 'setTitle']),
        onSubmit () {
            this.error = null
            this.$socket.emit('user.auth', this.form)
        }
    },
    components: {
    }
}
