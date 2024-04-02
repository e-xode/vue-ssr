import { shallowMount } from '@vue/test-utils'
import main from '@/test/main.mjs'

import ViewAuth from '@/views/user/auth/auth.vue'

describe('views/user/ViewAuth', () => {

    const propsData = {}

    const mountComponent = () => {
        return shallowMount(ViewAuth, {
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
