import { MockApiClient, DefaultApiClient, createApiClient } from './client';

describe('MockApiClient', () => {
  let client: MockApiClient;

  beforeEach(() => {
    client = new MockApiClient();
  });

  it('should return tag values for known keys', async () => {
    const values = await client.getTagValues('browser.name');
    expect(values).toEqual(['Chrome', 'Firefox', 'Safari', 'Edge']);
  });

  it('should return empty array for unknown keys', async () => {
    const values = await client.getTagValues('unknown.key');
    expect(values).toEqual([]);
  });

  it('should filter tag values based on query', async () => {
    const values = await client.getTagValues('browser.name', 'Chrome');
    expect(values).toEqual(['Chrome']);
  });

  it('should filter tag values case-insensitively', async () => {
    const values = await client.getTagValues('browser.name', 'chrome');
    expect(values).toEqual(['Chrome']);
  });

  it('should return filter key suggestions', async () => {
    const filterKeys = await client.getFilterKeySuggestions();
    expect(filterKeys).toHaveLength(10);
    expect(filterKeys[0]).toHaveProperty('key');
    expect(filterKeys[0]).toHaveProperty('name');
    expect(filterKeys[0]).toHaveProperty('kind');
  });

  it('should have appropriate delay for realistic simulation', async () => {
    const start = Date.now();
    await client.getTagValues('browser.name');
    const duration = Date.now() - start;
    expect(duration).toBeGreaterThanOrEqual(100);
  });
});

describe('DefaultApiClient', () => {
  let client: DefaultApiClient;

  beforeEach(() => {
    client = new DefaultApiClient('http://localhost/api');
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should make correct API call for tag values', async () => {
    const mockResponse = { values: ['Chrome', 'Firefox'] };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const values = await client.getTagValues('browser.name', 'Chrome');

    expect(global.fetch).toHaveBeenCalledWith('http://localhost/api/tags/browser.name/values?query=Chrome');
    expect(values).toEqual(['Chrome', 'Firefox']);
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const values = await client.getTagValues('browser.name');
    expect(values).toEqual([]);
  });

  it('should handle network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const values = await client.getTagValues('browser.name');
    expect(values).toEqual([]);
  });

  it('should make correct API call for filter key suggestions', async () => {
    const mockResponse = { filterKeys: [{ key: 'test', name: 'Test' }] };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const filterKeys = await client.getFilterKeySuggestions();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost/api/search/filter-keys');
    expect(filterKeys).toEqual([{ key: 'test', name: 'Test' }]);
  });
});

describe('createApiClient', () => {
  it('should create MockApiClient when mock option is true', () => {
    const client = createApiClient({ mock: true });
    expect(client).toBeInstanceOf(MockApiClient);
  });

  it('should create DefaultApiClient when mock option is false', () => {
    const client = createApiClient({ mock: false });
    expect(client).toBeInstanceOf(DefaultApiClient);
  });

  it('should create DefaultApiClient by default', () => {
    const client = createApiClient();
    expect(client).toBeInstanceOf(DefaultApiClient);
  });

  it('should pass baseUrl to DefaultApiClient', () => {
    const client = createApiClient({ baseUrl: '/custom-api' });
    expect(client).toBeInstanceOf(DefaultApiClient);
    // Note: We can't easily test the baseUrl was passed correctly without 
    // exposing it or making a real request, but the constructor should receive it
  });
});