import http from 'k6/http';
import { check } from 'k6';
import { sleep } from 'k6';
import { Trend } from 'k6/metrics';

export let options = {
    vus: 10,
    duration: '30s',
};


let iterationsCount = 0;
let checksPassedCount = 0;
let totalHttpRequestDuration = 0;
let httpRequestsFailedCount = 0;

export const metricResults = new Trend('metricResults');

export default function () {
    const url = 'http://localhost:8081/request-registration';
    const payload = JSON.stringify({
        email: "test@example.com"
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(url, payload, params);

    check(res, {
        "is status 204": (r) => r.status === 204,
    });


    iterationsCount++;
    if (res.status === 204) {
        checksPassedCount++;
    }
    totalHttpRequestDuration += res.timings.duration;
    if (res.status !== 204) {
        httpRequestsFailedCount++;
    }

    metricResults.add(res.timings.duration);

    sleep(1);
}

export function handleSummary(data) {

    const percentageOfChecksPassed = (checksPassedCount / iterationsCount) * 100;


    const medianHttpRequestDuration = totalHttpRequestDuration / iterationsCount;

    console.log(`Number of iterations: ${iterationsCount}`);
    console.log(`Percentage of checks passed: ${percentageOfChecksPassed}%`);
    console.log(`Median HTTP request duration: ${medianHttpRequestDuration} ms`);
    console.log(`HTTP requests failed: ${httpRequestsFailedCount}`);

  
    const results = {
        numberOfIterations: iterationsCount,
        percentageOfChecksPassed: percentageOfChecksPassed,
        medianHttpRequestDuration: medianHttpRequestDuration,
        httpRequestsFailed: httpRequestsFailedCount,
    };
    const fileName = 'metricResults.json';
    const file = open(fileName, 'w');
    file.write(JSON.stringify(results, null, 2));
    file.close();
}
