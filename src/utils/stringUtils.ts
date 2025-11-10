export const truncate = (text: string, limit = 15) =>
    text?.length > limit ? text.slice(0, limit) + "..." : text;
