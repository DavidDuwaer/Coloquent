import {HttpClientResponse} from "../HttpClientResponse";
import {HttpClientPromise} from "../HttpClientPromise";
import {FetchHttpClientResponse} from "./FetchHttpClientResponse";
import {Thenable} from "../Types";

export class FetchHttpClientPromise implements HttpClientPromise
{
    private transformedPromise: Promise<FetchHttpClientResponse>;

    constructor(fetchPromise: Promise<Response>) {
        this.transformedPromise = fetchPromise.then(async (response: Response) => {
            if (!response.ok) {
                throw response;
            }
            const text = await response.text();
            const data = text ? JSON.parse(text) : null;
            return new FetchHttpClientResponse(data, response);
        });
    }

    then<U>(onFulfilled?: (value: HttpClientResponse) => (Thenable<U>|U), onRejected?: (error: any) => (Thenable<U>|U)): Promise<U>;
    then<U>(onFulfilled?: (value: HttpClientResponse) => (Thenable<U>|U), onRejected?: (error: any) => void): Promise<U> {
        return <Promise<U>> this.transformedPromise.then(onFulfilled, onRejected);
    }

    catch<U>(onRejected?: (error: any) => (Thenable<U>|U)): Promise<U> {
        return <Promise<U>> this.transformedPromise.catch(onRejected);
    }
}
