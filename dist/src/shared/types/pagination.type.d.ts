export declare class CursorPaginationDto {
    cursor?: string;
    limit?: number;
}
export interface PaginatedResponseDto<T> {
    data: T[];
    pagination: {
        nextCursor: string | null;
        hasMore: boolean;
        total?: number;
    };
}
export declare function encodeCursor(date: Date, id: string): string;
export declare function decodeCursor(cursor: string): {
    date: string;
    id: string;
};
