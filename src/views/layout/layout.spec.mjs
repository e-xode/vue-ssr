import { shallowMount } from '@vue/test-utils'
import main from '@/test/main.mjs'

import DefaultLayout from '@/views/layout/layout.vue'

describe('views/DefaultLayout', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(DefaultLayout, {
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
