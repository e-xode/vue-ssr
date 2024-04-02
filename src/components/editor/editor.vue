<template>
    <div class="component-editor">
        <div
            v-if="editor"
            class="component-editor-controls"
        >
            <vui-button
                :disabled="!editor.can().chain().focus().toggleBold().run()"
                :class="{
                    'is-active': editor.isActive('bold')
                }"
                @click="editor.chain().focus().toggleBold().run()"
            >
                <i class="fa-solid fa-bold" />
            </vui-button>
            <vui-button
                :disabled="!editor.can().chain().focus().toggleItalic().run()"
                :class="{
                    'is-active': editor.isActive('italic')
                }"
                @click="editor.chain().focus().toggleItalic().run()"
            >
                <i class="fa-solid fa-italic" />
            </vui-button>
            <vui-button
                :disabled="!editor.can().chain().focus().toggleStrike().run()"
                :class="{
                    'is-active': editor.isActive('strike')
                }"
                @click="editor.chain().focus().toggleStrike().run()"
            >
                <i class="fa-solid fa-strikethrough" />
            </vui-button>
            <vui-button
                :class="{
                    'is-active': editor.isActive('paragraph')
                }"
                @click="editor.chain().focus().setParagraph().run()"
            >
                <i class="fa-solid fa-paragraph" />
            </vui-button>
            <vui-button
                :disabled="!editor.can().chain().focus().toggleCode().run()"
                :class="{
                    'is-active': editor.isActive('code')
                }"
                @click="editor.chain().focus().toggleCode().run()"
            >
                <i class="fa-solid fa-code" />
            </vui-button>
            <vui-button
                :class="{
                    'is-active': editor.isActive('heading', { level: 1 })
                }"
                @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            >
                h1
            </vui-button>
            <vui-button
                :class="{
                    'is-active': editor.isActive('heading', { level: 2 })
                }"
                @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            >
                h2
            </vui-button>
            <vui-button
                :class="{
                    'is-active': editor.isActive('heading', { level: 3 })
                }"
                @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
            >
                h3
            </vui-button>
            <vui-button
                :class="{
                    'is-active': editor.isActive('heading', { level: 4 })
                }"
                @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
            >
                h4
            </vui-button>
            <vui-button
                :class="{
                    'is-active': editor.isActive('heading', { level: 5 })
                }"
                @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
            >
                h5
            </vui-button>
            <vui-button
                :class="{
                    'is-active': editor.isActive('heading', { level: 6 })
                }"
                @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
            >
                h6
            </vui-button>
            <vui-button
                :class="{
                    'is-active': editor.isActive('bulletList')
                }"
                @click="editor.chain().focus().toggleBulletList().run()"
            >
                <i class="fa-solid fa-list" />
            </vui-button>
            <vui-button
                :class="{
                    'is-active': editor.isActive('orderedList')
                }"
                @click="editor.chain().focus().toggleOrderedList().run()"
            >
                <i class="fa-solid fa-list-ol" />
            </vui-button>
            <vui-button
                @click="editor.chain().focus().unsetAllMarks().run()"
            >
                clear marks
            </vui-button>
            <vui-button @click="editor.chain().focus().clearNodes().run()">
                clear nodes
            </vui-button>


            <vui-button
                :class="{
                    'is-active': editor.isActive('codeBlock')
                }"
                @click="editor.chain().focus().toggleCodeBlock().run()"
            >
                code block
            </vui-button>
            <vui-button
                :class="{
                    'is-active': editor.isActive('blockquote')
                }"
                @click="editor.chain().focus().toggleBlockquote().run()"
            >
                blockquote
            </vui-button>
            <vui-button
                @click="editor.chain().focus().setHorizontalRule().run()"
            >
                horizontal rule
            </vui-button>
            <vui-button
                @click="editor.chain().focus().setHardBreak().run()"
            >
                hard break
            </vui-button>
            <vui-button
                :disabled="!editor.can().chain().focus().undo().run()"
                @click="editor.chain().focus().undo().run()"
            >
                <i class="fa-solid fa-rotate-left" />
            </vui-button>
            <vui-button
                :disabled="!editor.can().chain().focus().redo().run()"
                @click="editor.chain().focus().redo().run()"
            >
                <i class="fa-solid fa-rotate-right" />
            </vui-button>
        </div>
        <div class="component-editor-content">
            <editor-content
                :editor="editor"
            />
        </div>
    </div>
</template>

<script
    src="./editor.mjs"
/>

<style
    lang="scss"
    src="./editor.scss"
/>
