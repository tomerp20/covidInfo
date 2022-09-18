 async function sendRequest(url, method = 'GET', settings = {}, data = undefined) {
      //Create options object and inject the specific settings
      const options = {
          method,
          ...settings
      }
      //Add the data to the request, if it exists
      if(data) {
          options.body = data
      }
      //Send the request
      const response = await fetch(url, options);
      //If response is ok, parse it and return
      if(response.ok) {
          const responseBody = await response.json()
          return responseBody
      }
      //if not, throw an error
      else {
        //Maybe use response.text?
        const responseBody = await response.json()
        throw(new Error(`Didnt get info from server: ${responseBody}`))
      }
}


