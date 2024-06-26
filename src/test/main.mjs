import { createI18n } from 'vue-i18n'
import store from '@/store/store.mjs'
import vui from '@e-xode/vui'

import {
    RouterViewStub,
    RouterLinkStub
} from '@vue/test-utils'

document.querySelector = jest.fn(() => ({
    setAttribute: jest.fn()
}))

const i18n = createI18n({
    legacy: false,
    missingWarn: false,
    fallbackWarn: false
})
export default {
    global: {
        plugins: [
            i18n,
            store,
            vui
        ],
        provide: {
        },
        mocks: {
            $route: {
                params: {},
                query: {}
            },
            $socket: {
                on: jest.fn(),
                emit: jest.fn()
            }
        },
        stubs: {
            RouterLink: RouterLinkStub,
            RouterView: RouterViewStub
        },
        directives: {
        }
    }
}
