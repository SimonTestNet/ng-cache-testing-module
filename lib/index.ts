import {
  TestBed,
  getTestBed,
  ComponentFixture,
  TestModuleMetadata,
  TestBedStatic
} from "@angular/core/testing";

export function cacheTestingModule() {
  const realResetTestingModule = TestBed.resetTestingModule;
  const realConfigureTestingModule = TestBed.configureTestingModule;

  beforeAll(() => {
    let initialized = false;
    let testBedStatic: TestBedStatic;
    TestBed.configureTestingModule = (moduleDef: TestModuleMetadata) => {
      if (!initialized) {
        initialized = true;
        testBedStatic = realConfigureTestingModule(moduleDef);
      }
      return testBedStatic;
    };
    TestBed.resetTestingModule();
    TestBed.resetTestingModule = () => TestBed;
  });

  afterAll(() => {
    TestBed.configureTestingModule = realConfigureTestingModule;
    TestBed.resetTestingModule = realResetTestingModule;
    TestBed.resetTestingModule();
  });

  afterEach(() => {
    const testBed: any = getTestBed();
    testBed._activeFixtures.forEach((fixture: ComponentFixture<{ destroy: () => void }>) =>
      fixture.destroy()
    );
    // reset ViewEngine TestBed
    testBed._instantiated = false;
    // reset Ivy TestBed
    testBed._testModuleRef = null;
  });
}
