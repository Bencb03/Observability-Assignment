const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger"); // Import JaegerExporter
const { trace } = require("@opentelemetry/api");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

// Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");

module.exports = (serviceName) => {
    const exporter = new JaegerExporter({
        // Configure the exporter to send trace data to Jaeger
        endpoint: 'http://localhost:14268/api/traces'
    });

    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });

    // Use BatchSpanProcessor for better performance
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    provider.register();

    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new MongoDBInstrumentation(),
        ],
        tracerProvider: provider,
    });

    return trace.getTracer(serviceName);
};


