import { shallowMount } from '@vue/test-utils'
import main from '@/test/main.mjs'

import ViewRegister from '@/views/user/register/register.vue'

describe('views/user/ViewRegister', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(ViewRegister, {
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
