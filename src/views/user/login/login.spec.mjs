import { shallowMount } from '@vue/test-utils'
import main from '@/test/main.mjs'

import ViewLogin from '@/views/user/login/login.vue'

describe('views/user/ViewLogin', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(ViewLogin, {
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
