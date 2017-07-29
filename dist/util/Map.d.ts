export declare class Map<T> {
    protected data: {
        [key: string]: T;
    };
    get(key: string): T;
    set(key: string, value: T): void;
}
