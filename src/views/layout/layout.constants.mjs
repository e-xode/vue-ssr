const dropdownAdminItems = [
    {
        icon: 'fa-solid fa-hammer',
        label: 'component.header.admin',
        route: {
            name: 'ViewAdmin'
        }
    }
]
const dropdownitems = [
    {
        icon: 'fa-solid fa-sliders',
        label: 'component.header.account',
        value: 'account',
        route: {
            name: 'ViewAccount'
        }
    },
    {
        icon: 'fa-solid fa-door-open',
        label: 'component.header.logout',
        value: 'logout'
    }
]
export {
    dropdownAdminItems,
    dropdownitems
}
