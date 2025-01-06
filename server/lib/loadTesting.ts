import type { Express } from "express";
import { performance } from "perf_hooks";

interface LoadTestResult {
  endpoint: string;
  method: string;
  timestamp: string;
  responseTime: number;
  status: number;
  success: boolean;
}

class LoadTester {
  private results: LoadTestResult[] = [];
  private readonly maxResults = 1000; // Keep last 1000 results

  addResult(result: LoadTestResult) {
    this.results.push(result);
    if (this.results.length > this.maxResults) {
      this.results.shift();
    }
  }

  getResults() {
    return this.results;
  }

  getSummary() {
    if (this.results.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        successRate: 0,
        p95ResponseTime: 0
      };
    }

    const successfulRequests = this.results.filter(r => r.success).length;
    const responseTimes = this.results.map(r => r.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / this.results.length;

    // Calculate 95th percentile
    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p95ResponseTime = sortedTimes[p95Index];

    return {
      totalRequests: this.results.length,
      avgResponseTime,
      successRate: (successfulRequests / this.results.length) * 100,
      p95ResponseTime
    };
  }
}

const loadTester = new LoadTester();

export function setupLoadTesting(app: Express) {
  // Endpoint to trigger a load test
  app.post("/api/loadtest", async (req, res) => {
    const { endpoint, method = "GET", duration = 10, rps = 10 } = req.body;

    if (!endpoint) {
      return res.status(400).json({ message: "Endpoint is required" });
    }

    // Start load test
    const startTime = performance.now();
    const endTime = startTime + (duration * 1000);
    const interval = 1000 / rps;

    const runTest = async () => {
      if (performance.now() >= endTime) {
        return res.json(loadTester.getSummary());
      }

      try {
        const testStartTime = performance.now();
        const response = await fetch(`http://localhost:5000${endpoint}`, { method });
        const responseTime = performance.now() - testStartTime;

        loadTester.addResult({
          endpoint,
          method,
          timestamp: new Date().toISOString(),
          responseTime,
          status: response.status,
          success: response.ok
        });

      } catch (error) {
        loadTester.addResult({
          endpoint,
          method,
          timestamp: new Date().toISOString(),
          responseTime: performance.now() - startTime,
          status: 500,
          success: false
        });
      }

      setTimeout(runTest, interval);
    };

    runTest();
  });

  // Endpoint to get load test results
  app.get("/api/loadtest/results", (req, res) => {
    res.json({
      results: loadTester.getResults(),
      summary: loadTester.getSummary()
    });
  });
}