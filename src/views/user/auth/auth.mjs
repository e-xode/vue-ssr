import { mapActions, mapMutations } from 'vuex'

export default {
    name: 'ViewAuth',
    beforeUnmount() {
        this.$socket.off('auth')
    },
    created() {
        this.setDescription(this.$t('page.auth.metas.description'))
        this.setKeywords(this.$t('page.auth.metas.keywords'))
        this.setTitle(this.$t('page.auth.metas.title'))
    },
    mounted() {
        this.$socket.on('auth', ({ _id, email, error, status }) => {
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
        auth () {
            this.$socket.emit('auth', this.form)
        }
    },
    components: {
    }
}
