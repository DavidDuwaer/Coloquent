import {HttpClientResponse} from "../HttpClientResponse";
import {AxiosPromise, AxiosResponse} from "axios";
import {HttpClientPromise} from "../HttpClientPromise";
import {AxiosHttpClientResponse} from "./AxiosHttpClientResponse";
import {Thenable} from "../Types";

export class AxiosHttpClientPromise implements HttpClientPromise
{
    private axiosPromise: AxiosPromise;

    constructor(axiosPromise: AxiosPromise) {
        this.axiosPromise = axiosPromise;
    }

    then<U>(onFulfilled?: (value: HttpClientResponse) => (Thenable<U>|U), onRejected?: (error: any) => (Thenable<U>|U)): Promise<U>;
    then<U>(onFulfilled?: (value: HttpClientResponse) => (Thenable<U>|U), onRejected?: (error: any) => void): Promise<U> {
        let onFulfilled2: (value: AxiosResponse) => (Thenable<U>|U) =
            (axiosResponse => onFulfilled(new AxiosHttpClientResponse(axiosResponse)));
        return <Promise<U>> this.axiosPromise.then(
            onFulfilled2,
            onRejected
        );
    }

    catch<U>(onRejected?: (error: any) => (Thenable<U>|U)): Promise<U> {
        return <Promise<U>> this.axiosPromise.catch(
            onRejected
        );
    }
}
