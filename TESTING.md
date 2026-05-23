# 🧪 Testing Guide

Guide complet pour exécuter et écrire des tests avec Vitest.

## Table des matières

- [Installation](#installation)
- [Exécution des tests](#exécution-des-tests)
- [Structure des tests](#structure-des-tests)
- [Écrire de nouveaux tests](#écrire-de-nouveaux-tests)
- [Couverture de code](#couverture-de-code)
- [Mocking](#mocking)
- [Conseils et bonnes pratiques](#conseils-et-bonnes-pratiques)

---

## Installation

Les dépendances de test sont déjà installées. Pour les installer manuellement:

```bash
npm install
```

Dépendances de test incluses:

- `vitest` - Framework de test
- `@vitest/ui` - Interface utilisateur pour Vitest
- `@vue/test-utils` - Utilitaires pour tester les composants Vue
- `@testing-library/vue` - Bibliothèque de test accessibilité
- `happy-dom` - Environnement DOM léger

---

## Exécution des tests

### Mode watch (développement)

```bash
npm test
```

Les tests se relancent automatiquement quand vous modifiez un fichier.

### Mode run (une seule exécution)

```bash
npm run test:run
```

Idéal pour CI/CD ou avant de commiter.

### Interface utilisateur

```bash
npm run test:ui
```

Ouvre une interface web pour visualiser les tests en temps réel.

### Couverture de code

```bash
npm run test:coverage
```

Génère un rapport de couverture de code.

---

## Structure des tests

Les tests sont organisés par type:

```
tests/
├── setup.js              # Configuration globale des tests
├── fixtures/
│   └── mockData.js       # Données de test et mocks
└── unit/
    ├── shared.log.test.js       # Tests pour shared/log.js
    ├── shared.email.test.js     # Tests pour shared/email.js
    ├── stores.auth.test.js      # Tests pour Pinia auth store
    ├── router.test.js           # Tests pour le routeur
    ├── views.index.test.js      # Tests pour les vues
    ├── components.header.test.js # Tests pour les composants
    ├── validation.test.js       # Tests de validation
    └── api.utils.test.js        # Tests pour les utilitaires API
```

---

## Écrire de nouveaux tests

### Structure de base

```javascript
// tests/unit/myFeature.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { myFunction } from '#src/my/module';

describe('my/module.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('myFunction', () => {
    it('should do something specific', () => {
      const result = myFunction('input');
      expect(result).toBe('expected output');
    });

    it('should handle edge cases', () => {
      expect(() => myFunction(null)).not.toThrow();
    });
  });
});
```

### Exemple: Tester une fonction async

```javascript
import { describe, it, expect } from 'vitest';
import { fetchData } from '#src/api/data';

describe('API Functions', () => {
  it('should fetch data successfully', async () => {
    const data = await fetchData();

    expect(data).toBeDefined();
    expect(data.id).toBeDefined();
  });
});
```

### Exemple: Tester un composant Vue

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MyComponent from '#src/components/MyComponent.vue';

describe('MyComponent.vue', () => {
  it('should render properly', () => {
    const wrapper = mount(MyComponent, {
      props: { message: 'Test' },
      global: {
        stubs: {
          VButton: true,
          VContainer: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Test');
  });

  it('should emit event on button click', async () => {
    const wrapper = mount(MyComponent);

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('click')).toBeTruthy();
  });
});
```

---

## Couverture de code

### Générer un rapport

```bash
npm run test:coverage
```

Cela génère un rapport HTML dans `coverage/index.html`.

### Augmenter la couverture

1. **Identifier les zones non couvertes**

   ```bash
   npm run test:coverage
   # Ouvrir coverage/index.html dans un navigateur
   ```

2. **Écrire des tests pour les lignes manquantes**
   - Concentrez-vous sur les chemins critiques
   - Les cas d'erreur et les cas limites

3. **Vérifier la couverture**
   ```bash
   npm run test:coverage
   ```

### Objectifs de couverture recommandés

| Type         | Couverture |
| ------------ | ---------- |
| Déclarations | > 70%      |
| Branches     | > 65%      |
| Fonctions    | > 70%      |
| Lignes       | > 70%      |

---

## Mocking

### Mocking de modules

```javascript
import { vi } from 'vitest';

// Mock complet d'un module
vi.mock('mongodb', () => ({
  MongoClient: class {
    connect() {
      return Promise.resolve();
    }
  },
}));
```

### Mocking de fonctions

```javascript
import { vi } from 'vitest';

const mockFunction = vi.fn();

// Vérifier que la fonction a été appelée
expect(mockFunction).toHaveBeenCalled();

// Vérifier les arguments
expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2');

// Retourner une valeur spécifique
mockFunction.mockReturnValue('result');

// Retourner une promise
mockFunction.mockResolvedValue({ data: 'result' });
```

### Mocking de fetch

```javascript
import { vi } from 'vitest';

global.fetch = vi.fn();

fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ user: { id: 1 } }),
});
```

---

## Assertions courantes

```javascript
// Égalité
expect(value).toBe(expectedValue);
expect(value).toEqual(expectedValue);

// Vérité
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Types
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(typeof value).toBe('string');

// Comparaisons
expect(number).toBeGreaterThan(5);
expect(number).toBeLessThan(10);

// Contenu
expect(text).toContain('substring');
expect(array).toContain('element');

// Tableaux
expect(array).toHaveLength(3);
expect(array).toEqual([1, 2, 3]);

// Erreurs
expect(() => throw new Error()).toThrow();
expect(() => action()).not.toThrow();

// Mocking
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('arg');
```

---

## Conseils et bonnes pratiques

### ✅ À faire

- **Nommer les tests clairement**

  ```javascript
  it('should return hashed password when signupHandler is called');
  ```

- **Tester un comportement unique par test**

  ```javascript
  it('should validate email format', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });
  ```

- **Utiliser beforeEach pour la configuration**

  ```javascript
  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });
  ```

- **Grouper les tests avec describe**
  ```javascript
  describe('AuthStore', () => {
    describe('signup', () => {
      it('should...', () => {});
    });
  });
  ```

### ❌ À éviter

- **Tester plusieurs comportements dans un test**

  ```javascript
  // Mauvais
  it('should validate and save user', () => {
    expect(isValid(user)).toBe(true);
    expect(save(user)).toBe(true);
  });
  ```

- **Tester les détails d'implémentation**

  ```javascript
  // Mauvais - dépend du détail interne
  it('should call formatData', () => {
    expect(formatDataMock).toHaveBeenCalled();
  });
  ```

- **Avoir des tests qui dépendent l'un de l'autre**
  ```javascript
  // Mauvais - test 2 dépend du test 1
  it('test 1', () => { setup() })
  it('test 2', () => { expect(data).toBe(setup result) })
  ```

---

## Exécution dans CI/CD

### GitHub Actions

```yaml
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

### Pre-commit hooks

```bash
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run test:run"
```

---

## Débogage des tests

### Exécuter un seul test

```javascript
// Utiliser .only pour exécuter un seul test
it.only('should test this feature', () => {
  expect(true).toBe(true);
});
```

### Ignorer un test temporairement

```javascript
// Utiliser .skip pour ignorer temporairement
it.skip('should test this feature', () => {
  // ...
});
```

### Afficher les logs

```javascript
import { describe, it, expect } from 'vitest';

describe('Debug test', () => {
  it('should log information', () => {
    console.log('Debug info:', data);
    expect(data).toBeDefined();
  });
});
```

Exécutez avec:

```bash
npm test -- --reporter=verbose
```

---

## Ressources

- [Documentation Vitest](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/)
- [Pinia Testing](https://pinia.vuejs.org/cookbook/testing.html)

---

**Besoin d'aide?**

- Consultez les tests existants dans `tests/unit/`
- Vérifiez la configuration dans `vitest.config.js`
- Lisez la documentation de Vitest officielle

Happy testing! 🎉
