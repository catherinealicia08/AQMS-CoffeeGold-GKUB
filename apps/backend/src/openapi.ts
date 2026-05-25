import type { OpenAPIV3 } from 'openapi-types';

export const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'AQMS Backend API',
    version: '0.1.0',
    description:
      'HTTP API untuk service backend. Catatan: sistem AQMS utama memakai Firestore langsung dari web/mobile; backend fokus sebagai subscriber MQTT.',
  },
  servers: [
    {
      url: '/',
      description: 'Current host (Cloud Run / same-origin)',
    },
    {
      url: 'http://localhost:4000',
      description: 'Local dev',
    },
  ],
  tags: [{ name: 'System' }, { name: 'Orders' }],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description:
          'Opsional. Jika env `BACKEND_HTTP_API_KEY` diset, endpoint orders butuh header ini.',
      },
    },
    schemas: {
      OrderSummary: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string', example: 'ORDER-12345678' },
          status: { type: 'string', nullable: true },
          queue_number: { type: 'number', nullable: true },
          user_name: { type: 'string', nullable: true },
          total: { type: 'number', nullable: true },
          created_at: { type: 'object', description: 'Firestore timestamp', nullable: true },
          completed_at: { type: 'object', description: 'Firestore timestamp', nullable: true },
        },
        required: ['id', 'status', 'queue_number', 'user_name', 'total', 'created_at', 'completed_at'],
      },
      OrdersListResponse: {
        type: 'object',
        additionalProperties: false,
        properties: {
          count: { type: 'number', example: 1 },
          orders: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderSummary' },
          },
        },
        required: ['count', 'orders'],
      },
      ErrorResponse: {
        type: 'object',
        additionalProperties: true,
        properties: {
          error: { type: 'string' },
          details: { type: 'string' },
        },
        required: ['error'],
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    service: { type: 'string', example: 'backend' },
                  },
                  required: ['status', 'service'],
                },
              },
            },
          },
        },
      },
    },
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List orders (from Firestore)',
        parameters: [
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string', example: 'queued' },
            description: 'Filter by status (opsional).',
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            description: 'Max items (default 20).',
          },
          {
            name: 'x-api-key',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Required only if `BACKEND_HTTP_API_KEY` is configured.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OrdersListResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized (x-api-key required)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '500': {
            description: 'Server error',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/orders/{orderId}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order detail (from Firestore)',
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'ORDER-12345678' },
          },
          {
            name: 'x-api-key',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Required only if `BACKEND_HTTP_API_KEY` is configured.',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  description: 'Firestore order document (id + full data)',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized (x-api-key required)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '404': {
            description: 'Not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '500': {
            description: 'Server error',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/openapi.json': {
      get: {
        tags: ['System'],
        summary: 'OpenAPI spec (JSON)',
        responses: {
          '200': {
            description: 'OpenAPI document',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
        },
      },
    },
    '/docs': {
      get: {
        tags: ['System'],
        summary: 'Swagger UI',
        description: 'UI dokumentasi interaktif (Swagger UI).',
        responses: {
          '200': {
            description: 'HTML',
            content: { 'text/html': { schema: { type: 'string' } } },
          },
        },
      },
    },
  },
};
