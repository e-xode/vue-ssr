const renderCSS = async(vite) => {
    const mod = await vite.moduleGraph.getModuleByUrl('/src/app.vue')
    const css = mod.ssrTransformResult.deps
        .filter(d => d.endsWith('.scss'))
        .map(url => `<link rel="stylesheet" type="text/css" href="${url}">`)
        .join('')

    return {
        css
    }
}

export {
    renderCSS
}
