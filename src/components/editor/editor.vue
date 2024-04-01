<template>
    <div class="component-editor">
        <div
            v-if="editor"
            class="component-editor-controls"
        >
            <vui-button
                @click="editor.chain().focus().toggleBold().run()"
                :disabled="!editor.can().chain().focus().toggleBold().run()"
                :class="{
                    'is-active': editor.isActive('bold')
                }"
            >
                <i class="fa-solid fa-bold" />
            </vui-button>
            <vui-button
                @click="editor.chain().focus().toggleItalic().run()"
                :disabled="!editor.can().chain().focus().toggleItalic().run()"
                :class="{
                    'is-active': editor.isActive('italic')
                }"
            >
                <i class="fa-solid fa-italic" />
            </vui-button>
            <vui-button
                @click="editor.chain().focus().toggleStrike().run()"
                :disabled="!editor.can().chain().focus().toggleStrike().run()"
                :class="{
                    'is-active': editor.isActive('strike')
                }"
            >
                <i class="fa-solid fa-strikethrough" />
            </vui-button>
            <vui-button
                @click="editor.chain().focus().setParagraph().run()"
                :class="{
                    'is-active': editor.isActive('paragraph')
                }"
            >
                <i class="fa-solid fa-paragraph" />
            </vui-button>
            <vui-button
                @click="editor.chain().focus().toggleCode().run()"
                :disabled="!editor.can().chain().focus().toggleCode().run()"
                :class="{
                    'is-active': editor.isActive('code')
                }"
            >
                <i class="fa-solid fa-code" />
            </vui-button>
            <vui-button
                @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                :class="{
                    'is-active': editor.isActive('heading', { level: 1 })
                }"
            >
                h1
            </vui-button>
            <vui-button
                @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                :class="{
                    'is-active': editor.isActive('heading', { level: 2 })
                }"
            >
                h2
            </vui-button>
            <vui-button
                @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
                :class="{
                    'is-active': editor.isActive('heading', { level: 3 })
                }"
            >
                h3
            </vui-button>
            <vui-button
                @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
                :class="{
                    'is-active': editor.isActive('heading', { level: 4 })
                }"
            >
                h4
            </vui-button>
            <vui-button
                @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
                :class="{
                    'is-active': editor.isActive('heading', { level: 5 })
                }"
            >
                h5
            </vui-button>
            <vui-button
                @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
                :class="{
                    'is-active': editor.isActive('heading', { level: 6 })
                }"
            >
                h6
            </vui-button>
            <vui-button
                @click="editor.chain().focus().toggleBulletList().run()"
                :class="{
                    'is-active': editor.isActive('bulletList')
                }"
            >
                <i class="fa-solid fa-list" />
            </vui-button>
            <vui-button
                @click="editor.chain().focus().toggleOrderedList().run()"
                :class="{
                    'is-active': editor.isActive('orderedList')
                }"
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
                @click="editor.chain().focus().toggleCodeBlock().run()"
                :class="{
                    'is-active': editor.isActive('codeBlock')
                }"
            >
                code block
            </vui-button>
            <vui-button
                @click="editor.chain().focus().toggleBlockquote().run()"
                :class="{
                    'is-active': editor.isActive('blockquote')
                }"
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
                @click="editor.chain().focus().undo().run()"
                :disabled="!editor.can().chain().focus().undo().run()"
            >
                <i class="fa-solid fa-rotate-left" />
            </vui-button>
            <vui-button
                @click="editor.chain().focus().redo().run()"
                :disabled="!editor.can().chain().focus().redo().run()"
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
