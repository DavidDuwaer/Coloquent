import {HttpClient} from "../HttpClient";
import {HttpClientPromise} from "../HttpClientPromise";
import {FetchHttpClientPromise} from "./FetchHttpClientPromise";

export class FetchHttpClient implements HttpClient
{
    private withCredentials: boolean = false;

    public readonly defaults = {
        headers: {} as Record<string, string>
    };

    setWithCredentials(withCredentials: boolean): void {
        this.withCredentials = withCredentials;
    }

    get(url: string): HttpClientPromise {
        return new FetchHttpClientPromise(fetch(url, this.requestInit('GET')));
    }

    delete(url: string): HttpClientPromise {
        return new FetchHttpClientPromise(fetch(url, this.requestInit('DELETE')));
    }

    head(url: string): HttpClientPromise {
        return new FetchHttpClientPromise(fetch(url, this.requestInit('HEAD')));
    }

    post(url: string, data?: any): HttpClientPromise {
        return new FetchHttpClientPromise(fetch(url, this.requestInit('POST', data)));
    }

    put(url: string, data?: any): HttpClientPromise {
        return new FetchHttpClientPromise(fetch(url, this.requestInit('PUT', data)));
    }

    patch(url: string, data?: any): HttpClientPromise {
        return new FetchHttpClientPromise(fetch(url, this.requestInit('PATCH', data)));
    }

    getImplementingClient(): this {
        return this;
    }

    private requestInit(method: string, data?: any): RequestInit {
        const headers: Record<string, string> = {
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json',
            ...this.defaults.headers,
        };

        const init: RequestInit = {
            method,
            headers,
            credentials: this.withCredentials ? 'include' : 'same-origin',
        };

        if (data !== undefined) {
            init.body = JSON.stringify(data);
        }

        return init;
    }
}
