import fs from 'fs'
import { mongo } from '#src/server/shared/db.mjs'
import dayjs from 'dayjs'
import findAll from '#src/server/db/findAll.mjs'
import { log } from '#src/server/shared/log.mjs'

mongo().then(async({ db, error }) => {
    if (db && !error) {
        const now = dayjs().format('YYYY-MM-DD')
        const { items, total = 0 } = await findAll({
            collection: 'clothes',
            db,
            params: {
                enabled: true,
                quantity: { $gte: 1 }
            },
            query: { offset: 0, max: 99999 }
        })

        let xml = `<?xml version="1.0" encoding="UTF-8"?>`
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
        xml += `<url>`
        xml += `<loc>https://ssr.e-xode.net/</loc>`
        xml += `<lastmod>${now}</lastmod>`
        xml += `</url>`
        xml += `<url>`
        xml += `<loc>https://ssr.e-xode.net/login</loc>`
        xml += `<lastmod>${now}</lastmod>`
        xml += `</url>`
        xml += `<url>`
        xml += `<loc>https://ssr.e-xode.net/register</loc>`
        xml += `<lastmod>${now}</lastmod>`
        xml += `</url>`

        log(`sitemap updating with ${total} items`)

        items.forEach((item) => {
            xml += `<url>`
            xml += `<loc>https://ssr.e-xode.net/item/${item.slug}/</loc>`
            xml += `<lastmod>${now}</lastmod>`
            xml += `</url>`
        })
        xml += `</urlset>`

        fs.writeFileSync('/app/public/sitemap.xml', xml)
        process.exit(0)
    }
})
