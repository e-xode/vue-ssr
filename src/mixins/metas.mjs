import { mapActions, mapGetters } from 'vuex'

export default {
    created() {
        this.onMetas()
    },
    computed: {
        ...mapGetters('metas', ['metas'])
    },
    methods: {
        ...mapActions('metas', ['setMetas']),
        onMetasChange({ description, image, keywords, title }) {
            this.setMetas({ description, image, keywords, title })
            if (typeof document !== 'undefined') {
                document.title = title
                document.querySelector('meta[name="description"]').setAttribute('content', description)
                document.querySelector('meta[name="keywords"]').setAttribute('content', keywords)
                document.querySelector('meta[name="title"]').setAttribute('content', title)
                document.querySelector('meta[property="og:description"]').setAttribute('content', description)
                document.querySelector('meta[property="og:url"]').setAttribute('content', window.location)
                document.querySelector('meta[property="og:image"]').setAttribute('content', `${window.location.origin}${image}`)
            }
        }
    }
}
