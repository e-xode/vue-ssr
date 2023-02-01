import { shallowMount } from '@vue/test-utils'
import setup from '@/test/setup.mjs'

import DefaultLayout from '@/views/layout/layout.vue'

describe('views/DefaultLayout', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(DefaultLayout, {
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
