import { SanitizeUrlPipe } from './sanitize-url.pipe';

describe('SanitizePipe', () => {
  it('create an instance', () => {
    const pipe = new SanitizeUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
