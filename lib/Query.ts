import * as URLSearchParams from 'url-search-params';

export class Query
{
    private searchParams: URLSearchParams;

    constructor(query: string = '')
    {
        this.searchParams = new URLSearchParams(query);
    }

    public set(key: string, value: any)
    {
        this.searchParams.set(this.toParamName(key), value);
    }

    public toString(): string
    {
        return this.searchParams.toString();
    }

    private toParamName(key: string)
    {
        let escape = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?]/;

        if (escape.test(key)) {
            throw new Error('Parameter name should not contain special characters.')
        }

        let prepared = '';
        const parts = key.split('.');

        for (let part of parts) {
            if (prepared === '') {
                prepared = part;
                continue;
            }

            prepared += `[${part}]`;
        }

        return prepared;
    }
}