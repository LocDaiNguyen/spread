import { AngularSpreadPage } from './app.po';

describe('angular-spread App', () => {
  let page: AngularSpreadPage;

  beforeEach(() => {
    page = new AngularSpreadPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
