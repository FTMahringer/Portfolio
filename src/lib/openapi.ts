/** OpenAPI 3.1 spec for the portfolio content & contact APIs. */
export const OPENAPI_SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'Portfolio API',
    version: '1.0.0',
    description:
      'REST API for the portfolio site. The **contact** endpoint is public. ' +
      'The **content** write endpoints require a static Bearer token (`Authorization: Bearer <API_SECRET>`).',
    contact: { url: 'https://portfolio.ftmahringer.com/contact' },
  },
  servers: [{ url: '/api', description: 'Same-origin API' }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'Static API key set via `API_SECRET` environment variable.',
      },
    },
    schemas: {
      ContactRequest: {
        type: 'object',
        required: ['name', 'email', 'message'],
        properties: {
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          subject: { type: 'string', example: 'Hello!' },
          message: {
            type: 'string',
            description: 'Supports Markdown.',
            example: '## Hello\n\nI saw your portfolio and wanted to say hi.',
          },
        },
      },
      ContactResponse: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: true },
          id: { type: 'string', example: 'abc123' },
        },
      },
      ContentItem: {
        type: 'object',
        properties: {
          slug: { type: 'string', example: 'my-project' },
          title: { type: 'string', example: 'My Project' },
          date: { type: 'string', format: 'date', example: '2024-01-15' },
        },
        additionalProperties: true,
      },
      ContentWriteRequest: {
        type: 'object',
        required: ['slug', 'frontmatter', 'content'],
        properties: {
          slug: { type: 'string', example: 'my-new-project' },
          frontmatter: {
            type: 'object',
            description: 'Key-value pairs written as YAML front-matter.',
            example: { title: 'My New Project', date: '2024-06-01', featured: true },
          },
          content: {
            type: 'string',
            description: 'MDX body content (Markdown + JSX).',
            example: '## About\n\nThis project does cool things.',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Missing required field: email' },
        },
      },
    },
  },
  paths: {
    '/contact': {
      post: {
        operationId: 'sendContactEmail',
        tags: ['Contact'],
        summary: 'Send a contact email',
        description:
          'Sends an email to the site owner via Resend. No authentication required. ' +
          'File attachments are supported via `multipart/form-data`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ContactRequest' },
            },
            'multipart/form-data': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ContactRequest' },
                  {
                    properties: {
                      files: {
                        type: 'array',
                        items: { type: 'string', format: 'binary' },
                        description: 'Optional file attachments.',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Email sent successfully.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ContactResponse' } },
            },
          },
          '400': {
            description: 'Missing or invalid fields.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '500': {
            description: 'Email delivery failed.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/content/{type}': {
      parameters: [
        {
          name: 'type',
          in: 'path',
          required: true,
          schema: { type: 'string', enum: ['projects', 'blog', 'experience'] },
          description: 'Content collection to operate on.',
        },
      ],
      get: {
        operationId: 'listContent',
        tags: ['Content'],
        summary: 'List content entries',
        description: 'Returns front-matter metadata for all entries in the collection. Public.',
        responses: {
          '200': {
            description: 'Array of content items.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ContentItem' },
                },
              },
            },
          },
          '400': {
            description: 'Unknown content type.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      post: {
        operationId: 'createOrUpdateContent',
        tags: ['Content'],
        summary: 'Create or update a content entry',
        description:
          'Creates or overwrites an MDX file in the appropriate `content/` directory. ' +
          '**Requires Bearer token authentication.**',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ContentWriteRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Entry created or updated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    slug: { type: 'string', example: 'my-new-project' },
                    path: { type: 'string', example: 'content/projects/my-new-project.mdx' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid Bearer token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '400': {
            description: 'Invalid request body.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Contact', description: 'Send contact emails to the site owner.' },
    { name: 'Content', description: 'Read and write MDX content collections.' },
  ],
}
