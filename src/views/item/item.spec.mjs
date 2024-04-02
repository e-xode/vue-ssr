import { shallowMount } from '@vue/test-utils'
import main from '@/test/main.mjs'

import ViewItem from '@/views/item/item.vue'

describe('views/ViewItem', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(ViewItem, {
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
