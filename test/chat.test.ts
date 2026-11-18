// Talking to the assistant itself ("what is your name?") gets a short answer that leads back to the Quran;
// a question about the Quran still gets ayahs, even when it says "you".
import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';

const engine = new Engine();
const refs = (q: string) => engine.ask(q).ayahs.map((a) => `${a.s}:${a.a}`);

describe('talking to the assistant', () => {
  it('its name, in English, Banglish, Bengali and Arabic', () => {
    for (const q of ['what is your name?', 'whats ur name', 'may i know your name', 'what should i call you', 'tomar nam ki', 'তোমার নাম কী?', 'ما اسمك؟']) {
      const r = engine.ask(q);
      expect(r.kind, q).toBe('about');
      expect(r.ayahs, q).toEqual([]);
      expect(r.answer, q).toMatch(/Quran Assistant|কুরআন সহকারী|مساعد القرآن/);
    }
  });

  it('a personal question: a program, no faith or age, and what it can show instead', () => {
    for (const q of ['are you a muslim?', 'how old are you', 'do you pray?', 'what is your favourite color', 'what is your job', 'তুমি কি মুসলিম?', 'apni ki manush?', 'هل أنت مسلم؟']) {
      const r = engine.ask(q);
      expect(r.kind, q).toBe('about');
      expect(r.ayahs, q).toEqual([]);
    }
    expect(engine.ask('are you a muslim?').answer).toContain('I am a computer program, not a person');
  });

  it('praise gets thanks; a joke or chat gets what it can do', () => {
    for (const q of ['you are very helpful', 'i love you', 'good bot', 'you are amazing', 'তুমি খুব ভালো', 'أحبك']) expect(engine.ask(q).kind, q).toBe('thanks');
    for (const q of ['tell me a joke', 'lets chat', 'can you dance']) {
      const r = engine.ask(q);
      expect(r.kind, q).toBe('chat');
      expect(r.answer, q).toContain('I am only a Quran assistant');
    }
  });
});

describe('a question about the Quran is still answered from the Quran', () => {
  it('topics, stories and comfort, even with "you" in them', () => {
    expect(refs('what does the quran say about patience')).toContain('2:153');
    expect(refs('can you show me ayahs about prayer')).toContain('29:45');
    expect(refs('do you know the story of yusuf')).toContain('12:4');
    expect(refs('can you help me i feel sad')).toContain('94:5');
    expect(engine.ask('how are you').kind).toBe('greeting');
  });

  it('the words of an ayah that speaks to "you" are not taken for chat', () => {
    expect(refs('you are the best nation')).toContain('3:110');
    expect(refs('to you your religion')).toContain('109:6');
    expect(refs('call upon me i will respond to you')).toContain('40:60');
    expect(refs('remember me and i will remember you')).toContain('2:152');
    expect(refs('be grateful to your parents')).toContain('17:23');
    for (const q of ['did you think we created you in vain', 'allah loves you', 'those who take religion as a joke']) {
      expect(['chat', 'about', 'thanks'], q).not.toContain(engine.ask(q).kind);
    }
  });
});
