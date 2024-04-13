import { shallowMount } from '@vue/test-utils'
import main from '@/test/main.mjs'

import AdminComponent from './admin.vue'

describe('views/admin', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(AdminComponent, {
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
