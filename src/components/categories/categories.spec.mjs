import { shallowMount } from '@vue/test-utils'
import main from '@/test/main.mjs'

import CategoriesComponent from './categories.vue'

describe('components/categories', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(CategoriesComponent, {
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
