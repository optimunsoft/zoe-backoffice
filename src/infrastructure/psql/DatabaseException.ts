export default class DatabaseException extends Error {
    constructor(message: string) {
        super(message);
    }
}