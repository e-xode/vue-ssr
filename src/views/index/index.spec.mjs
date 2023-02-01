import { shallowMount } from '@vue/test-utils'
import setup from '@/test/setup.mjs'

import ViewIndex from '@/views/index/index.vue'

describe('views/ViewIndex', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(ViewIndex, {
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
