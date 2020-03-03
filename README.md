# Cache Angular Testing Module

Make your Angular tests fly by caching the testing module.

## Installation

```sh
npm i -D ng-cache-testing-module
```

## Usage

Just add `cacheTestingModule();` to your test suites (the root `describe`s in your test files). e.g.:

```ts
import { cacheTestingModule } from "ng-cache-testing-module";

describe("MyComponent", () => {
  cacheTestingModule();

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyComponent]
    });
  });

  // ...
});
```

## Troubleshooting

You may need to tweak the way you configure the testing module depending on your coding practices and how you write your tests. This is usually because of assuming the initial state of the dependencies, using global state, or using global spies.

### Shared State

A common scenario is when your component depends on a stubbed service with state, and some tests change the service state that others use. In that case, replace `useValue` with `useFactory` in the providers to make sure your stubs always start the same.

```ts
import { cacheTestingModule } from "ng-cache-testing-module";

describe("MyComponent", () => {
  cacheTestingModule();

  beforeEach(() => {
    const namesServiceStub = () => ({
      name: "A"
    });
    TestBed.configureTestingModule({
      declarations: [MyComponent],
      providers: [{ provide: NamesService, useFactory: namesServiceStub }]
    });
  });

  // ...
});
```

### Global Spies

Your tests may not be sharing a global state but they may be sharing global spies. In that case move the spies to the tests, not the setup.

```ts
import { cacheTestingModule } from "ng-cache-testing-module";

describe("MyComponent", () => {
  cacheTestingModule();

  beforeEach(() => {
    const namesServiceStub = () => ({
      add: () => ({})
    });
    TestBed.configureTestingModule({
      declarations: [MyComponent],
      providers: [{ provide: NamesService, useFactory: namesServiceStub }]
    });
  });

  it("Tests A", () => {
    const namesServiceStub = TestBed.get(NameService);
    spyOn(namesServiceStub, "add");
    // ...
  });
});
```

---

If you like this please check out [SimonTest](https://marketplace.visualstudio.com/items?itemName=SimonTest.simontest). It takes care of the most tedious part of testing components and services: mocking dependencies. This extension analyzes your code and creates the necessary stubs, configures the TestBed, and it even generates basic tests.
