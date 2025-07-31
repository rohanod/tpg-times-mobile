class ResponseLogger {
  private static instance: ResponseLogger;
  
  static getInstance(): ResponseLogger {
    if (!ResponseLogger.instance) {
      ResponseLogger.instance = new ResponseLogger();
    }
    return ResponseLogger.instance;
  }

  async logResponse(url: string, response: Response, data: any) {

    // Log to console in development (simplified)
    if (__DEV__) {
      // Only log basic info and errors
      if (response.status !== 200 || 
          (data?.connections && data.connections.length === 0) ||
          !data?.connections) {
        console.log('=== API Issue ===');
        console.log('URL:', url);
        console.log('Status:', response.status, response.statusText);
        console.log('Connections count:', data?.connections?.length || 0);
      }
    }
  }

  logError(url: string, error: any) {

    if (__DEV__) {
      console.log('=== API Error Log ===');
      console.log('URL:', url);
      console.log('Error:', error.message || error.toString());
    }


  }
}

export default ResponseLogger;