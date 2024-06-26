import { pages } from '#src/shared/page'
import queries from '#src/server/db/index.mjs'

const route = async({ db, req, res, router, store }) => {
    const { currentRoute } = router
    const { query: { offset = 0, max = 25 }, session: { locale, user } } = req
    const match = pages.find((p) => p.route.name === currentRoute.value.name)
    const page =  match
        ? match
        : { queries: [] }

    if (user?._id) {
        const dbuser = await queries.findUser({ db, _id: user._id })
        await store.dispatch('user/auth', {
            ...dbuser,
            status: user.status
        })
    }
    switch (currentRoute.value.name) {
        case 'ViewBase': {
            return res.status(301).redirect(`/${locale}`)
        }
        case 'ViewAdmin': {
            if (!user?.isadmin) {
                return res.status(307).redirect(`/${locale}/error`)
            }
            break
        }
        case 'ViewAdminEdit': {
            if (!user?.isadmin) {
                return res.status(307).redirect(`/${locale}/error`)
            }
            break
        }
        case 'ViewAccount': {
            if (![200,449].includes(user?.status)) {
                return res.status(307).redirect(`/${locale}/error`)
            }
            break
        }
        default: {
            page.queries.forEach(async(query) => {
                switch(query.type) {
                    case 'findOne': {
                        const item = await queries[query.type]({
                            collection: query.collection,
                            db,
                            params: {
                                ...currentRoute.value.params,
                                ...query.params
                            },
                            query: { ...req.query }
                        })
                        if (item?._id) {
                            const set = `${query.store.name}/${query.store.setItem}`
                            await store.commit(set, item)
                        }
                        break
                    }
                    default: {
                        const { items, total }  = await queries[query.type]({
                            collection: query.collection,
                            db,
                            field: query.field,
                            params: query.params,
                            query: query.main
                                ? { ...req.query, max, offset }
                                : {}
                        })
                        if(items?.length) {
                            const set = `${query.store.name}/${query.store.setItemsPaginated}`
                            await store.dispatch(set, {
                                items,
                                paging: query.main
                                    ? { max, offset, total }
                                    : { max: total, offset: 0, total }
                            })
                        }
                        break
                    }
                }
            })
            break
        }
    }
}
export {
    route
}
