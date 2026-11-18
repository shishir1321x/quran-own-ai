// The message bar on a phone (an iPhone squeezed the text box to one word when five controls shared its row).
// A real phone must still be looked at by hand; this checks the structure and the rules that make it fit.
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { PAGE_HTML } from '../src/page.js';

const css = PAGE_HTML.match(/<style>([\s\S]*?)<\/style>/)![1];

function openPage() {
  const dom = new JSDOM(PAGE_HTML, {
    runScripts: 'dangerously', url: 'http://localhost:8787/', pretendToBeVisual: true,
    beforeParse(window) {
      (window as any).Element.prototype.scrollIntoView = () => {};
      (window as any).webkitSpeechRecognition = class { start() {} stop() {} };
    },
  });
  return dom.window.document;
}

describe('the message bar', () => {
  it('the text box shares its bar only with 🎤 and Send; the language and New chat are on a line above', () => {
    const doc = openPage();
    const bar = doc.getElementById('q')!.parentElement!;
    expect(bar.className).toBe('composer');
    expect([...bar.children].map((e) => e.id)).toEqual(['q', 'mic', 'btn']);
    const tools = doc.querySelector('.tools')!;
    expect(tools.contains(doc.getElementById('voiceLang'))).toBe(true);
    expect(tools.contains(doc.getElementById('newChat'))).toBe(true);
  });

  it('Send keeps its name for screen readers when it shows only an arrow', () => {
    const btn = openPage().getElementById('btn')!;
    expect(btn.getAttribute('aria-label')).toBe('Send');
    expect(btn.querySelector('.arrow')).not.toBeNull();
  });

  it('fits a phone: 16px text (no zoom on iPhone), the safe area at the bottom, a narrow-screen layout', () => {
    expect(PAGE_HTML).toMatch(/<meta name="viewport" content="[^"]*viewport-fit=cover/);
    expect(css).toMatch(/#q\s*\{[^}]*font-size:\s*16px/);
    expect(css).toMatch(/env\(safe-area-inset-bottom\)/);
    expect(css).toMatch(/@media \(max-width: 560px\)/);
    expect(css).toMatch(/@media \(hover: none\)[^{]*\{[^}]*\.keys\s*\{\s*display:\s*none/);   // no "Shift+Enter" on a phone
  });

  it('the text box grows with a longer question, and shrinks again after sending', () => {
    const doc = openPage();
    const q = doc.getElementById('q') as HTMLTextAreaElement;
    Object.defineProperty(q, 'scrollHeight', { configurable: true, get: () => 90 });
    q.value = 'a long question\nwith a second line';
    q.dispatchEvent(new (doc.defaultView as any).Event('input', { bubbles: true }));
    expect(q.style.height).toBe('90px');
  });
});
