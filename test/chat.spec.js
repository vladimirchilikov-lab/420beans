import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the chat module
const createMockReq = (method = 'POST', body = {}) => ({
  method,
  body,
  headers: {},
});

const createMockRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { this.body = data; return this; },
    end: function() { return this; },
    setHeader: function(key, value) { this.headers[key] = value; return this; },
  };
  return res;
};

describe('AI Chat Feature Flag', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it('returns 503 when AI_CHAT_ENABLED is not set', async () => {
    delete process.env.AI_CHAT_ENABLED;
    const chatModule = await import('../api/chat.js');
    const req = createMockReq('POST', { messages: [{ role: 'user', content: 'test' }] });
    const res = createMockRes();
    await chatModule.default(req, res);
    expect(res.statusCode).toBe(503);
    expect(res.body.error).toBe('AI chat is disabled');
  });

  it('returns 503 when AI_CHAT_ENABLED is false', async () => {
    process.env.AI_CHAT_ENABLED = 'false';
    const chatModule = await import('../api/chat.js');
    const req = createMockReq('POST', { messages: [{ role: 'user', content: 'test' }] });
    const res = createMockRes();
    await chatModule.default(req, res);
    expect(res.statusCode).toBe(503);
    expect(res.body.error).toBe('AI chat is disabled');
  });

  it('returns 503 when AI_CHAT_ENABLED is empty string', async () => {
    process.env.AI_CHAT_ENABLED = '';
    const chatModule = await import('../api/chat.js');
    const req = createMockReq('POST', { messages: [{ role: 'user', content: 'test' }] });
    const res = createMockRes();
    await chatModule.default(req, res);
    expect(res.statusCode).toBe(503);
  });

  it('returns 405 for non-POST requests (even when disabled)', async () => {
    process.env.AI_CHAT_ENABLED = 'true';
    const chatModule = await import('../api/chat.js');
    const req = createMockReq('GET', {});
    const res = createMockRes();
    await chatModule.default(req, res);
    expect(res.statusCode).toBe(405);
  });

  it('does not call Gemini API when disabled', async () => {
    delete process.env.AI_CHAT_ENABLED;
    const fetchSpy = vi.spyOn(global, 'fetch');
    const chatModule = await import('../api/chat.js');
    const req = createMockReq('POST', { messages: [{ role: 'user', content: 'test' }] });
    const res = createMockRes();
    await chatModule.default(req, res);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
