# Azure Function Middleware Helper

Here is a simple module to implement middleware patter for Azure Function HTTP handler, similar to what already exists for Express.js.
While there are already a few modules similar to this one, creating this module was also a simple exercice I did to better understand the pattern with Azure Fucntion.

## How it works

The middleware pattern execute functions sequencialy to check or enhance a request parameter before executing core logic in the function. This purpose is to keep your Azure Functions simple and focused to your core logic.
Because middleware are executed at runtime when client request is received, you will want to keep all your reusable context out of scope of middlewares (DB initialization, service discovery...).
Middleware is a great use for JWT verification, data structure check or other prerequisites check. 

+The Middleware class enhance the context object of the request with a next() function used to stack multiple middlewares.

+If you detect an Error, Middleware expects that you feed the client response before throwing the error. Therefore, you manage data sent back to client.  

## How to use it 

1. Install module

Clone repo to your local computer.
git clone https://github.com/matthieugi/Azure-Function-Middleware 

in your Auzre function project, link the module
npm install path/to/Azure-Function-Middleware

(will soon be published to npm)

import { AzureFunctionMiddleware, ContextMiddleware, Middleware } from 'azurefunctionmiddleware';

2. Initiate Middleware class

```javascript
const middleware = new Middleware();
```

3. define and stack your middlewares

First, you will need to create your middlewares. You should always call context.next() to trigger next element in the stack execution. Here is a simple request logger. ContextMiddleware is a child type of Azure Function "Context" type, enhanced with the next function.


```javascript
const logger: AzureFunctionMiddleware = async function(context: ContextMiddleware) {
    context.log.info(context.req);
    context.next();
}
```

Then stack your middleware. You can chain use function to stack all your middlewares or link to Azure Function

```javascript
middleware = middleware.use(logger);
middleware = middleware.use(myOtherMiddleware).use(myAzureFunction)
```

4. Return default handler 

Export default handler.

```javascript
export default middleware.listen();
```

## Other

Please create an issue if you have any questions or comment !