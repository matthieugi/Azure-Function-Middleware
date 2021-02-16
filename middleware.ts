import { AzureFunction, Context } from "@azure/functions"

export interface ContextMiddleware extends Context {
    next?: () => Promise<void>;
}

export type AzureFunctionMiddleware = (context: ContextMiddleware, ...args: any[]) => void | Promise<any>;


export class Middleware {
    middlewares: (AzureFunctionMiddleware | AzureFunction)[] = [];

    use(func: AzureFunctionMiddleware|AzureFunction) {
        this.middlewares.push(func);
        return this;
    }

    listen() {
        return (context: ContextMiddleware, ...args: any[]) => this.run(context, ...args);
    }

    async run(context: ContextMiddleware, ...args: any[]) {
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