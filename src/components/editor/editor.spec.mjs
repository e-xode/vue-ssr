import { shallowMount } from '@vue/test-utils'
import main from '@/test/main.mjs'

import EditorComponent from './editor.vue'

describe('components/editor', () => {

    const propsData = {
    }

    const mountComponent = () => {
        return shallowMount(EditorComponent, {
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
