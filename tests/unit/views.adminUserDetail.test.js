import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import AdminUserDetailView from '@/views/Admin/AdminUserDetailView.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { userId: 'user-1' } }),
  useRouter: () => ({ push: () => {} }),
}));

vi.mock('@/composables/useLocalePath', () => ({
  useLocalePath: () => ({ localePath: (path) => `/en${path}` }),
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      form: { email: 'Email', name: 'Name', save: 'Save', cancel: 'Cancel' },
      error: {
        server: 'Server error',
        admin: { cannotModifyAdmin: 'An admin account cannot be blocked' },
      },
      admin: {
        users: {
          backToList: 'Back',
          detailTitle: 'User detail',
          info: 'Info',
          blocked: 'Blocked',
          registered: 'Registered',
          lastUpdate: 'Updated',
          lastLogin: 'Last login',
          edit: 'Edit',
          type: 'Type',
          typeUser: 'User',
          typeAdmin: 'Admin',
          block: 'Block',
          unblock: 'Unblock',
          blockSuccess: 'User blocked',
          unblockSuccess: 'User unblocked',
          recentActivity: 'Activity',
          blockConfirm: { title: 'Confirm', message: 'Sure?', blockIps: 'Block IPs' },
        },
        logs: { date: 'Date', event: 'Event', ip: 'IP' },
      },
    },
  },
});

const passthrough = { template: '<div><slot /></div>' };
const buttonStub = { template: '<button><slot /></button>' };
const alertStub = {
  props: ['type'],
  template: '<div class="alert" :data-type="type"><slot /></div>',
};
const stubNames = [
  'VContainer',
  'VRow',
  'VCol',
  'VCard',
  'VCardTitle',
  'VCardText',
  'VCardActions',
  'VChip',
  'VList',
  'VListItem',
  'VListItemTitle',
  'VListItemSubtitle',
  'VTable',
  'VForm',
  'VDialog',
  'VSpacer',
  'VProgressCircular',
  'VTextField',
  'VSelect',
  'VCheckbox',
];

const components = {
  VBtn: buttonStub,
  VAlert: alertStub,
  ...Object.fromEntries(stubNames.map((name) => [name, passthrough])),
};

const userPayload = {
  user: { _id: 'user-1', name: 'Jane', email: 'jane@example.com', type: 'user', isBlocked: false },
  recentLogs: [],
};

function jsonResponse(ok, body) {
  return { ok, json: () => Promise.resolve(body) };
}

async function mountView() {
  const wrapper = mount(AdminUserDetailView, {
    global: { plugins: [i18n], components },
  });
  await flushPromises();
  return wrapper;
}

function buttonsWithText(wrapper, text) {
  return wrapper.findAll('button').filter((button) => button.text() === text);
}

describe('views/Admin/AdminUserDetailView.vue block and unblock', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('shows the localized API error when blocking is refused', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(true, userPayload))
      .mockResolvedValueOnce(jsonResponse(false, { error: 'error.admin.cannotModifyAdmin' }));
    const wrapper = await mountView();

    const confirm = buttonsWithText(wrapper, 'Block').at(-1);
    await confirm.trigger('click');
    await flushPromises();

    const alert = wrapper.find('.alert[data-type="error"]');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toBe('An admin account cannot be blocked');
    expect(wrapper.text()).not.toContain('User blocked');
  });

  it('shows the generic error when the block request fails on the network', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(true, userPayload))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const wrapper = await mountView();

    await buttonsWithText(wrapper, 'Block').at(-1).trigger('click');
    await flushPromises();

    expect(wrapper.find('.alert[data-type="error"]').text()).toBe('Server error');
    expect(console.error).toHaveBeenCalled();
  });

  it('shows the success message when blocking succeeds', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(true, userPayload))
      .mockResolvedValueOnce(jsonResponse(true, {}));
    const wrapper = await mountView();

    await buttonsWithText(wrapper, 'Block').at(-1).trigger('click');
    await flushPromises();

    expect(wrapper.find('.alert[data-type="success"]').text()).toBe('User blocked');
    expect(wrapper.find('.alert[data-type="error"]').exists()).toBe(false);
  });

  it('shows the localized API error when unblocking is refused', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(true, { ...userPayload, user: { ...userPayload.user, isBlocked: true } })
      )
      .mockResolvedValueOnce(jsonResponse(false, { error: 'error.admin.cannotModifyAdmin' }));
    const wrapper = await mountView();

    await buttonsWithText(wrapper, 'Unblock')[0].trigger('click');
    await flushPromises();

    expect(wrapper.find('.alert[data-type="error"]').text()).toBe(
      'An admin account cannot be blocked'
    );
    expect(wrapper.text()).not.toContain('User unblocked');
  });
});
