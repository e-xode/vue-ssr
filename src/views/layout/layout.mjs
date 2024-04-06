import { mapActions, mapGetters } from 'vuex'
import mixinMetas from '#src/mixins/metas'
import { dropdownAdminItems, dropdownitems } from './layout.constants.mjs'

export default {
    name: 'DefaultLayout',
    mixins: [
        mixinMetas
    ],
    beforeUnmount() {
        this.$socket.off('user.me')
    },
    computed: {
        ...mapGetters('user', ['email','isAdmin', 'isAuthenticated']),
        dropdownItems () {
            const { locale, isAdmin = false } = this
            return [
                ...(isAdmin ? dropdownAdminItems : []),
                ...dropdownitems
            ].map((item) => ({
                ...item,
                label: this.$t(item.label),
                route: (item.route
                    ? { ...item.route, params: { ...item.route.params, locale }}
                    :  null
                )
            }))
        },
        locale() {
            return this.$i18n.locale
        }
    },
    methods: {
        ...mapActions('user', ['auth', 'logout']),
        disconnect () {
            this.$socket.emit('user.logout')
            this.logout()
            this.$router.push({
                name: 'ViewLogin',
                params: {
                    locale: this.locale
                }
            })
        },
        onDropdown (value) {
            if (value === 'logout') {
                this.disconnect()
            }
        },
        onMetas () {
            this.onMetasChange({
                description: '',
                image: '',
                keywords: '',
                title: this.$t('page.index.metas.title')
            })
        }
    }
}
