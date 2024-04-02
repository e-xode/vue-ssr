import { shallowMount } from '@vue/test-utils'
import main from '@/test/main.mjs'

import ViewAccount from '@/views/user/account/account.vue'

describe('views/user/ViewAccount', () => {

    const propsData = {}

    const mountComponent = () => {
        return shallowMount(ViewAccount, {
            ...main,
            propsData
        })
    }

    afterEach(() => {
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
