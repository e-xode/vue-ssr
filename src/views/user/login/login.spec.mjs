import { shallowMount } from '@vue/test-utils'
import setup from '@/test/setup.mjs'

import ViewLogin from '@/views/user/login/login.vue'

describe('views/user/ViewLogin', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(ViewLogin, {
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
