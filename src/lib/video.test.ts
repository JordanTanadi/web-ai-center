import { describe, expect, it } from 'vitest';
import { embedVideo } from './video.ts';

describe('embedVideo', () => {
  it('YouTube watch / youtu.be / shorts → embed nocookie', () => {
    expect(embedVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
    expect(embedVideo('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
    expect(embedVideo('https://www.youtube.com/shorts/abcDEF123-_')).toBe(
      'https://www.youtube-nocookie.com/embed/abcDEF123-_',
    );
  });

  it('URL embed YouTube lama ikut dinormalkan ke nocookie', () => {
    expect(embedVideo('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
  });

  it('Vimeo angka → player.vimeo.com', () => {
    expect(embedVideo('https://vimeo.com/76979871')).toBe('https://player.vimeo.com/video/76979871');
  });

  it('URL tidak dikenal / bukan http(s) / rusak → null (tampilan pakai tautan)', () => {
    expect(embedVideo('https://contoh.com/video/1')).toBeNull();
    expect(embedVideo('javascript:alert(1)')).toBeNull();
    expect(embedVideo('bukan url')).toBeNull();
    expect(embedVideo(null)).toBeNull();
    expect(embedVideo('')).toBeNull();
    expect(embedVideo('https://youtu.be/')).toBeNull();
    expect(embedVideo('https://vimeo.com/channels/staffpicks')).toBeNull();
  });
});
