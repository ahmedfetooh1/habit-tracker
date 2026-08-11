const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load Swagger document specifications
const swaggerDocument = YAML.load(path.join(__dirname, '../../swagger.yaml'));

/**
 * Configures Swagger UI endpoint for API documentation
 */
const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = setupSwagger;