import {HttpClient} from "../HttpClient";
import {AxiosInstance, AxiosRequestConfig} from "axios";
import axios from 'axios';
import {HttpClientPromise} from "../HttpClientPromise";
import {AxiosHttpClientPromise} from "./AxiosHttpClientPromise";

export class AxiosHttpClient implements HttpClient
{
    private axiosInstance: AxiosInstance;
    private withCredentials: boolean;

    constructor(axiosInstance?: AxiosInstance) {
        if (axiosInstance === null || axiosInstance === undefined) {
            axiosInstance = axios.create();
        }
        this.axiosInstance = axiosInstance;
    }

    setWithCredentials(withCredentials: boolean): void
    {
      this.withCredentials = withCredentials;
    }

    get(url: string): HttpClientPromise {
        return new AxiosHttpClientPromise(
          this.axiosInstance.get(url, this.config)
        );
    }

    delete(url: string): HttpClientPromise {
        return new AxiosHttpClientPromise(
          this.axiosInstance.delete(url, this.config)
        );
    }

    head(url: string): HttpClientPromise {
        return new AxiosHttpClientPromise(
          this.axiosInstance.head(url, this.config)
        );
    }

    post(url: string, data?: any): HttpClientPromise {
        return new AxiosHttpClientPromise(
          this.axiosInstance.post(url, data, this.config)
        );
    }

    put(url: string, data?: any): HttpClientPromise {
        return new AxiosHttpClientPromise(
          this.axiosInstance.put(url, data, this.config)
        );
    }

    patch(url: string, data?: any): HttpClientPromise {
        return new AxiosHttpClientPromise(
          this.axiosInstance.patch(url, data, this.config)
        );
    }

    public getImplementingClient(): AxiosInstance
    {
        return this.axiosInstance;
    }

    private get config (): AxiosRequestConfig {
      return {
        withCredentials: this.withCredentials,
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-type': 'application/vnd.api+json',
        }
      }
    }
}
