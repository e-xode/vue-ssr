import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
    name: 'ViewAccount',
    beforeUnmount() {
        this.$socket.off('account')
    },
    created() {
        this.setDescription(this.$t('page.account.metas.description'))
        this.setKeywords(this.$t('page.account.metas.keywords'))
        this.setTitle(this.$t('page.account.metas.title'))
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
        ...mapMutations('metas', ['setDescription', 'setKeywords', 'setTitle']),
        onSubmit() {
            this.$socket.emit('account', this.form)
        }
    }
}
