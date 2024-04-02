import { shallowMount } from '@vue/test-utils'
import main from '@/test/main.mjs'

import ViewReset from '@/views/user/reset/reset.vue'

describe('views/user/ViewReset', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(ViewReset, {
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
