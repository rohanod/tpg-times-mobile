class ResponseLogger {
  private static instance: ResponseLogger;
  
  static getInstance(): ResponseLogger {
    if (!ResponseLogger.instance) {
      ResponseLogger.instance = new ResponseLogger();
    }
    return ResponseLogger.instance;
  }

  async logResponse(url: string, response: Response, data: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      url,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data,
      dataLength: JSON.stringify(data).length,
      hasConnections: data?.connections?.length || 0,
      hasStations: data?.stations?.length || 0,
    };

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
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      url,
      error: error.message || error.toString(),
      stack: error.stack,
    };

    if (__DEV__) {
      console.log('=== API Error Log ===');
      console.log('URL:', url);
      console.log('Error:', error.message || error.toString());
    }

    console.log('ERROR_LOG:', JSON.stringify(logEntry));
  }
}

export default ResponseLogger;