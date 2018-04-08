export class Map<T>
{
    protected data: {[key: string]: T};

    constructor()
    {
        this.data = {};
    }

    public get(key: string): T
    {
        return this.data[key];
    }

    public set(key: string, value: T): void
    {
        this.data[key] = value;
    }

    public toArray(): {[key: string]: T}
    {
        return this.data;
    }
}