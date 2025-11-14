const healthService = require('../services/health');

class HealthController {
  /**
   * PUBLIC_INTERFACE
   * check
   * Returns a static 200 OK health payload using HealthService.
   */
  check(req, res) {
    const healthStatus = healthService.getStatus();
    return res.status(200).json(healthStatus);
  }
}

module.exports = new HealthController();
