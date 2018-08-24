declare var global: any;

export function mockFetch({
  json = null,
  ok = true,
  status = 200,
}: {
  ok?: boolean;
  json?: any;
  status?: number;
}) {
  global.fetch = jest.fn(async () => ({
    json: async () => json,
    ok,
    status,
  }));
}
