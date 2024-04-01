import { shallowMount } from '@vue/test-utils'
import setup from '@/test/setup.mjs'

import ViewAccount from '@/views/user/account/account.vue'

describe('views/user/ViewAccount', () => {

    const propsData = {}

    const mountComponent = () => {
        return shallowMount(ViewAccount, {
            ...setup,
            propsData
        })
    }

    afterEach(() => {
        jest.restoreAllMocks()
        jest.resetAllMocks()
        jest.clearAllTimers()
        jest.useRealTimers()
    })

    beforeEach(() => {
        jest.useFakeTimers()
    })

    it('Should render', () => {
        const component = mountComponent()
        expect(component.exists()).toBeTruthy()
    })
})
