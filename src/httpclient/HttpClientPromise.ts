import {AxiosResponse} from "axios";
import {HttpClientResponse} from "./HttpClientResponse";
import {Thenable} from "./Types";
export interface HttpClientPromise
{
    // /**
    //  * If you call resolve in the body of the callback passed to the constructor,
    //  * your promise is fulfilled with result object passed to resolve.
    //  * If you call reject your promise is rejected with the object passed to reject.
    //  * For consistency and debugging (eg stack traces), obj should be an instanceof Error.
    //  * Any errors thrown in the constructor callback will be implicitly passed to reject().
    //  */
    // constructor(callback: (resolve : (value?: HttpClientResponse | Thenable<HttpClientResponse>) => void, reject: (error?: any) => void) => void);

    /**
     * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects.
     * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called.
     * Both callbacks have a single parameter , the fulfillment value or rejection reason.
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
     * If an error is thrown in the callback, the returned promise rejects with that error.
     *
     * @param onFulfilled called when/if "promise" resolves
     * @param onRejected called when/if "promise" rejects
     */
    then<U>(onFulfilled?: (value: HttpClientResponse) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
    then<U>(onFulfilled?: (value: HttpClientResponse) => U | Thenable<U>, onRejected?: (error: any) => void): Promise<U>;

    /**
     * Sugar for promise.then(undefined, onRejected)
     *
     * @param onRejected called when/if "promise" rejects
     */
    catch<U>(onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
}
