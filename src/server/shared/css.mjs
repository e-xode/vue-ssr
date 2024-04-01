const hash = (id) => {
    return id.split('').reduce((hashed, chr) => {
        hashed = ((hashed << 5) - hashed) + chr.charCodeAt(0)
        return hashed & hashed
    }, 0)
}

const isCss = (module) => {
    return module.ssrModule && (
        module.file?.endsWith('.scss') ||
        module.file?.endsWith('.css') ||
        module.id?.includes("vue&type=style")
    )
}

const cssModules = (components, vite) => {
    return components.reduce((array, component) => {
        const modules = vite.moduleGraph.getModulesByFile(component)
        return array.concat([...modules])
    }, [])
}

const cssExtract = ( modules, styles = [], checked = [] ) => {
    modules.forEach((module) => {
        const { size } = module.importedModules
        if (isCss(module)) {
            styles.push([module.url, module.ssrModule.default])
        }
        if (size > 0 && !checked.find(({ id }) => id === module.id)) {
            checked.push(module.id)
            cssExtract(module.importedModules, styles, checked)
        }
    })
    return styles.reduce((style, [id, content]) =>  {
        return `${style} <style type="text/css" css-id="${hash(id)}">${content}</style>`
    }, '')
}

const cssRemove = () => {
    if (import.meta.hot) {
        import.meta.hot.on("vite:beforeUpdate", (module) => {
            module.updates.forEach(({ acceptedPath }) => {
                const selector = `[css-id="${hash(acceptedPath)}"]`
                const style = document.querySelector(selector)
                if (style) {
                    style.remove()
                }
            })
        })
    }
}

export {
    cssExtract,
    cssModules,
    cssRemove
}
