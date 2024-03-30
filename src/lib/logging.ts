export enum LogLevel {
    Fatal,
    Error,
    Warning,
    Info,
}

export function log(loglevel: LogLevel, message: string) {
    console.log(`Log, Level ${loglevel}: ${message}`)
}