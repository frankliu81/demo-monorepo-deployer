export const handler = async (event: any, context: any, callback: any) => {
    console.log("CDK_SCOPE " + process.env.CDK_SCOPE)
    console.log("event " + JSON.stringify(event, null, 2))
    
    try {
        const method = event.httpMethod;
        // Get name, if present
        const widgetId = event.path.startsWith('/') ? event.path.substring(1) : event.path;
    
        if (method === "GET") {
          // GET / to get the names of all widgets
          if (event.path === "/") {
            return {
              statusCode: 200,
              headers: {},
              body: JSON.stringify({ service1: ['1']})
            };
          }
        }
    
        // We got something besides a GET, POST, or DELETE
        return {
          statusCode: 400,
          headers: {},
          body: "We only accept GET, POST, and DELETE, not " + method
        };
      } catch(error) {
        var body = error.stack || JSON.stringify(error, null, 2);
        return {
          statusCode: 400,
          headers: {},
          body: body
        }
      }
  };