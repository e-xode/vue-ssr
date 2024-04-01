import { shallowMount } from '@vue/test-utils'
import setup from '@/test/setup.mjs'

import ViewRegister from '@/views/user/register/register.vue'

describe('views/user/ViewRegister', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(ViewRegister, {
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
