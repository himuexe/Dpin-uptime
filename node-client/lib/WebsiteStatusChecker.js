const axios = require('axios');

class WebsiteStatusChecker {
  constructor(logger) {
    this.logger = logger;
    this.timeout = process.env.TIMEOUT_MS || 5000; // Default timeout: 5 seconds
  }

  /**
   * Check the status of a website
   * @param {string} url - The URL of the website to check
   * @returns {Promise<object>} - The status check result
   */
  async checkWebsite(url) {
    this.logger.info(`Checking website status: ${url}`);
    
    // Ensure URL has a protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    const startTime = Date.now();
    
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        validateStatus: null // Allow all status codes
      });
      
      const responseTime = Date.now() - startTime;
      this.logger.debug(`Request completed in ${responseTime}ms with status ${response.status}`);
      
      // Determine website status based on HTTP status code
      let status = this.determineStatus(response.status, responseTime);
      
      return {
        url,
        status,
        responseTime,
        httpStatus: response.status,
        message: this.getStatusMessage(status, response.status, responseTime)
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error(`Error checking website ${url}: ${error.message}`);
      
      // Determine status based on error type
      const status = 2; // Offline (Status.Offline)
      
      return {
        url,
        status,
        responseTime,
        httpStatus: null,
        message: `Error: ${error.code || error.message}`
      };
    }
  }

  /**
   * Determine the website status based on HTTP status code and response time
   * @param {number} httpStatus - The HTTP status code
   * @param {number} responseTime - The response time in milliseconds
   * @returns {number} - The status code (0: Unknown, 1: Online, 2: Offline, 3: Degraded)
   */
  determineStatus(httpStatus, responseTime) {
    if (!httpStatus) {
      return 0; // Unknown
    }
    
    // 2xx status codes indicate success
    if (httpStatus >= 200 && httpStatus < 300) {
      // If response time is too high, mark as degraded
      if (responseTime > this.timeout * 0.8) {
        return 3; // Degraded
      }
      return 1; // Online
    }
    
    // 5xx status codes indicate server errors
    if (httpStatus >= 500) {
      return 2; // Offline
    }
    
    // 4xx status codes indicate client errors
    if (httpStatus >= 400 && httpStatus < 500) {
      return 3; // Degraded
    }
    
    // 3xx status codes are redirects, consider them degraded
    if (httpStatus >= 300 && httpStatus < 400) {
      return 3; // Degraded
    }
    
    return 0; // Unknown
  }

  /**
   * Generate a status message based on status code and HTTP status
   * @param {number} status - The status code (0: Unknown, 1: Online, 2: Offline, 3: Degraded)
   * @param {number} httpStatus - The HTTP status code
   * @param {number} responseTime - The response time in milliseconds
   * @returns {string} - A human-readable status message
   */
  getStatusMessage(status, httpStatus, responseTime) {
    switch (status) {
      case 0: // Unknown
        return 'Status unknown';
      case 1: // Online
        return `Online - HTTP ${httpStatus} - Response time: ${responseTime}ms`;
      case 2: // Offline
        return httpStatus 
          ? `Offline - HTTP ${httpStatus} - Response time: ${responseTime}ms` 
          : 'Offline - Could not connect to server';
      case 3: // Degraded
        if (httpStatus >= 300 && httpStatus < 400) {
          return `Degraded - HTTP ${httpStatus} (Redirect) - Response time: ${responseTime}ms`;
        }
        if (httpStatus >= 400 && httpStatus < 500) {
          return `Degraded - HTTP ${httpStatus} (Client Error) - Response time: ${responseTime}ms`;
        }
        if (responseTime > this.timeout * 0.8) {
          return `Degraded - Slow response time: ${responseTime}ms`;
        }
        return `Degraded - HTTP ${httpStatus} - Response time: ${responseTime}ms`;
      default:
        return 'Status unknown';
    }
  }
}

module.exports = WebsiteStatusChecker; 