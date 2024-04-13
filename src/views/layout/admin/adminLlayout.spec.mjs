import { shallowMount } from '@vue/test-utils'
import main from '@/test/main.mjs'

import AdminLayout from './adminLayout.vue'

describe('views/layout/admin', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(AdminLayout, {
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
