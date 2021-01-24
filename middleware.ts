import { AzureFunction, Context } from "@azure/functions"

export interface ContextMiddleware extends Context {
    next?: () => Promise<void>;
}

export type AzureFunctionMiddleware = (context: ContextMiddleware, ...args: any[]) => Promise<void>;


export default class Middleware {
    middlewares: (AzureFunctionMiddleware|AzureFunction)[];

    constructor() {
        this.middlewares = [];
    }

    use(func: AzureFunctionMiddleware|AzureFunction) {
        this.middlewares.push(func);
        return this;
    }

    listen() {
        return (context: ContextMiddleware, ...args) => this.run(context, ...args);
    }

    async run(context: ContextMiddleware, ...args) {
        let index = 0;
        const middlewares = this.middlewares;
        
        const next =  async () => {
            context.next = next;

            const middleware = middlewares[index]
            index++;
            
            if (middleware){
                try {
                    await middleware(context, ...args);
                }
                catch (error) {
                    context.log.error(error);
                    return;
                }
            }
        }

        await next();
    }
}