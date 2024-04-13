import { shallowMount } from '@vue/test-utils'
import main from '@/test/main.mjs'

import DefaultLayout from './defaultLayout.vue'

describe('views/layout/default', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(DefaultLayout, {
            ...main,
            propsData
        })
    }

    afterEach(() => {
    })

    beforeEach(() => {
    })

    it('Should render', () => {
        const component = mountComponent()
        expect(component.exists()).toBeTruthy()
    })
})
