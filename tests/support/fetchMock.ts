declare var global: any;

interface CapturedRequest {
    url: string;
    config: {
        method: string;
        data: any;
    };
    headers: Record<string, string>;
    respondWith(opts: { response?: any; status?: number }): void;
}

class RequestList {
    private _requests: CapturedRequest[] = [];

    add(request: CapturedRequest): void {
        this._requests.push(request);
    }

    mostRecent(): CapturedRequest {
        return this._requests[this._requests.length - 1];
    }

    at(index: number): CapturedRequest {
        return this._requests[index];
    }

    reset(): void {
        this._requests = [];
    }

    get length(): number {
        return this._requests.length;
    }
}

class FetchMock {
    readonly requests = new RequestList();
    private originalFetch: typeof global.fetch | undefined;

    install(): void {
        this.requests.reset();
        this.originalFetch = (global as any).fetch;
        (global as any).fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
            return new Promise<Response>((resolve) => {
                const url = typeof input === 'string' ? input : input.toString();

                let headers: Record<string, string> = {};
                if (init?.headers && typeof init.headers === 'object' && !(init.headers instanceof Headers) && !Array.isArray(init.headers)) {
                    headers = { ...(init.headers as Record<string, string>) };
                } else if (init?.headers instanceof Headers) {
                    (init.headers as Headers).forEach((value, key) => { headers[key] = value; });
                } else if (Array.isArray(init?.headers)) {
                    for (const [key, value] of (init!.headers as string[][])) {
                        headers[key] = value;
                    }
                }

                const captured: CapturedRequest = {
                    url,
                    config: {
                        method: (init?.method ?? 'get').toLowerCase(),
                        data: init?.body as string | undefined,
                    },
                    headers,
                    respondWith: ({ response, status = 200 }: { response?: any; status?: number }) => {
                        const body = response !== undefined ? JSON.stringify(response) : null;
                        resolve(new Response(body, {
                            status,
                            headers: { 'Content-Type': 'application/json' },
                        }));
                    },
                };

                this.requests.add(captured);
            });
        };
    }

    uninstall(): void {
        if (this.originalFetch !== undefined) {
            (global as any).fetch = this.originalFetch;
        } else {
            delete (global as any).fetch;
        }
        this.requests.reset();
    }

    wait(callback: () => void, delay = 100): void {
        setTimeout(callback, delay);
    }
}

export const fetchMock = new FetchMock();
export default fetchMock;
