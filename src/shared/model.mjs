import categories from './json/model/categories.json' with { type: 'json' }
import clothes from './json/model/clothes.json' with { type: 'json' }
import countries from './json/model/countries.json' with { type: 'json' }
import logs from './json/model/logs.json' with { type: 'json' }
import orders from './json/model/orders.json' with { type: 'json' }
import posts from './json/model/posts.json' with { type: 'json' }
import users from './json/model/users.json' with { type: 'json' }

const collections = [
    categories,
    clothes,
    countries,
    logs,
    orders,
    posts,
    users
]
export {
    collections
}
