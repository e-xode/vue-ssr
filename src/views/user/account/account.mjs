import { mapActions, mapGetters } from 'vuex'

export default {
    name: 'ViewAccount',
    beforeUnmount() {
        this.$socket.off('account')
    },
    created() {
        const { commit } = this.$store
        commit('metas/setDescription', this.$t('page.account.metas.description'))
        commit('metas/setKeywords', this.$t('page.account.metas.keywords'))
        commit('metas/setTitle', this.$t('page.account.metas.title'))
    },
    mounted() {
        this.$socket.on('account', ({ _id, email, status }) => {
            switch (status) {
                case 200:
                    this.auth({ _id, email })
                    this.success = status
                    break
                case 400:
                        this.error = error
                    break
            }
        })
    },
    data() {
        return {
            error: null,
            success: null,
            form: {
                newpassword: null,
                oldpassword: null
            }
        }
    },
    computed: {
        ...mapGetters('user', ['email'])
    },
    methods: {
        ...mapActions('user', ['auth']),
        onSubmit() {
            this.$socket.emit('account', this.form)
        }
    }
}
