import { shallowMount } from '@vue/test-utils'
import main from '@/test/main.mjs'

import ViewError from '@/views/error/error.vue'

describe('views/ViewError', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(ViewError, {
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
