import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

export default {
  components: {
    EditorContent
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      editor: null
    }
  },
  watch: {
    modelValue(value) {
      const isSame = this.editor.getHTML() === value
      if (isSame) {
        return
      }
      this.editor.commands.setContent(value, false)
    }
  },
  mounted() {
    if (Editor) {
        this.editor = new Editor({
            content: this.modelValue,
            extensions: [
                StarterKit
            ],
            onUpdate: () => {
              this.$emit('update:modelValue', this.editor.getHTML())
            }
        })
    }
  },
  beforeUnmount() {
    this.editor.destroy()
  }
}
