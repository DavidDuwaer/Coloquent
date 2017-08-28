export abstract class PaginationSpec
{
    public abstract getPaginationParameters(): string[];

    /**
     * @param page the page number, starting with 1 (0 and 1 both lead to the first page)
     */
    public abstract setPage(value: number);

    public abstract setPageLimit(pageLimit: number);
}