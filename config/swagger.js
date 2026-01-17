const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BNP Digital Platform API',
            version: '1.0.0',
            description: 'API documentation for the multi-tenant BNP Digital Platform. This API handles the main portal operations and candidate-specific subdomain data.',
            contact: {
                name: 'Developer',
            },
        },
        tags: [
            { name: 'Auth', description: 'Authentication and User Management (Registration & Login are Public)' },
            { name: 'Candidates', description: 'Public Candidate Profiles and Search' },
            { name: 'Team', description: 'Candidate Team Management (Public and Private endpoints)' },
            { name: 'Media', description: 'Gallery and Media Management (Login Required)' },
            { name: 'Excel', description: 'Bulk Data Operations (Super Admin Only)' },
        ],
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        username: { type: 'string' },
                        role: { type: 'string', enum: ['super_admin', 'candidate'] },
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: { type: 'string' },
                        password: { type: 'string' }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['candidateNameEn', 'candidateNameBn', 'divisionId', 'districtId', 'constituteNo', 'password'],
                    properties: {
                        candidateNameEn: { type: 'string' },
                        candidateNameBn: { type: 'string' },
                        divisionId: { type: 'integer' },
                        districtId: { type: 'integer' },
                        constituteNo: { type: 'integer' },
                        password: { type: 'string' },
                        image: { type: 'string', format: 'binary' }
                    }
                },
                Candidate: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        fullNameEn: { type: 'string' },
                        fullNameBn: { type: 'string' },
                        slug: { type: 'string' },
                        divisionId: { type: 'integer' },
                        districtId: { type: 'integer' },
                        constituencyNo: { type: 'integer' },
                        photoUrl: { type: 'string' },
                        designation: { type: 'string' },
                        email: { type: 'string' },
                    }
                },
                CandidateProfile: {
                    allOf: [
                        { $ref: '#/components/schemas/Candidate' },
                        {
                            type: 'object',
                            properties: {
                                briefIntro: { type: 'string' },
                                introBn: { type: 'string' },
                                team: { type: 'array', items: { $ref: '#/components/schemas/TeamMember' } },
                                gallery: { type: 'array', items: { $ref: '#/components/schemas/MediaItem' } }
                            }
                        }
                    ]
                },
                TeamMember: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        role: { type: 'string' },
                        photoUrl: { type: 'string' },
                        facebookLink: { type: 'string' },
                        linkedinLink: { type: 'string' },
                    }
                },
                MediaItem: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        fileUrl: { type: 'string' },
                        fileType: { type: 'string', enum: ['image', 'video'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    }
                }
            }
        },
    },
    apis: ['./server.js', './routes/*.js', './controllers/*.js'], // Path to the API docs
};

const specs = swaggerJsDoc(options);

module.exports = {
    swaggerUi,
    swaggerSpec: specs,
};
