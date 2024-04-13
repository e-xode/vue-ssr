import { shallowMount } from '@vue/test-utils'
import main from '@/test/main.mjs'

import AdminEditComponent from './edit.vue'

describe('views/admin/edit', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(AdminEditComponent, {
            ...main,
            propsData
        })
    }

    afterEach(() => {
        main.global.mocks.$route.params = {}
    })

    beforeEach(() => {
        main.global.mocks.$route.params = {
            collection: 'category'
        }
    })

    it('Should render', () => {
        const component = mountComponent()
        expect(component.exists()).toBeTruthy()
    })
})
