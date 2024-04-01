import { mapActions, mapGetters } from 'vuex'
import * as R from 'ramda'
import { pages } from '#src/shared/page'
import mixinCollections from '#src/mixins/collections'
import mixinMetas from '#src/mixins/metas'

export default {
    name: 'ViewAccount',
    mixins: [
        mixinCollections,
        mixinMetas
    ],
    beforeUnmount() {
        this.$socket.off('user.account')
    },
    created() {
        this.onReset()
    },
    mounted() {
        this.$socket.on('user.account', (user) => {
            switch (user.status) {
                case 200:
                    this.auth(user)
                    this.success = user.status
                    this.onReset()
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
            form: {},
            success: null,
            timeout: null
        }
    },
    computed: {
        ...mapGetters('user', ['user']),
        countries() {
            return R.uniqBy(R.prop('_id'))([
                ...this.getCountries,
                ...(this.user?.country
                    ? [this.user.country]
                    : []
                )
            ])
        },
        page () {
            return pages.find((p) => p.route.name === 'ViewAccount')
        }
    },
    methods: {
        ...mapActions('user', ['auth']),
        onCountryKeyword ({ target }) {
            clearTimeout(this.timeout)
            this.timeout = setTimeout(() => {
                this.$socket.emit('data.collection', {
                    collection: 'country',
                    name: 'country',
                    params: {
                        field: 'name',
                        keyword: target?.value
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
        onSubmit() {
            this.error = null
            this.success = null
            this.$socket.emit('user.account', {
                ...this.user,
                ...this.form
            })
        },
        onReset() {
            this.form = {
                country: this.user.country,
                newpassword: null,
                oldpassword: null
            }
        }
    }
}
