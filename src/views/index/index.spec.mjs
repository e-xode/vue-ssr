import { shallowMount } from '@vue/test-utils'
import main from '@/test/main.mjs'

import ViewIndex from '@/views/index/index.vue'

describe('views/ViewIndex', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(ViewIndex, {
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
