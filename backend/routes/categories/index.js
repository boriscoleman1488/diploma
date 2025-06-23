import { authenticateUser } from '../../middleware/auth.js'
import {
    getCategoriesSchema,
    createCategorySchema,
    getCategoryByIdSchema,
    searchCategoriesSchema
} from '../../schemas/categorySchemas.js'

export default async function categoryRoutes(fastify, options) {

    fastify.get('/', {
        schema: getCategoriesSchema
    }, async (request, reply) => {
        try {
            const result = await fastify.categoryService.getAllCategories()

            if (!result.success) {
                return reply.code(500).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                categories: result.categories
            }
        } catch (error) {
            fastify.log.error('Categories fetch error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch categories'
            })
        }
    })

    fastify.post('/', {
        schema: createCategorySchema,
        preHandler: [authenticateUser]
    }, async (request, reply) => {
        try {
            const { name, description } = request.body

            const result = await fastify.categoryService.createCategory(name, description)

            if (!result.success) {
                return reply.code(500).send({
                    error: result.error,
                    message: result.message
                })
            }

            return result
        } catch (error) {
            fastify.log.error('Category creation error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to create category'
            })
        }
    })

    fastify.get('/:categoryId', {
        schema: getCategoryByIdSchema,
    }, async (request, reply) => {

        try {
            const { categoryId } = request.params

            const result = await fastify.categoryService.getCategoryById(categoryId)

            if (!result.success) {
                const statusCode = result.error === 'Category not found' ? 404 : 500
                return reply.code(statusCode).send({
                    error: result.error,
                    message: result.message
                })
            }

            return result
        } catch (error) {
            fastify.log.error('Category fetch error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch category'
            })
        }
    })

    fastify.get('/search/:query', {
        schema: searchCategoriesSchema,
    }, async (request, reply) => {
        try {
            const { query } = request.params

            const result = await fastify.categoryService.searchCategories(query)

            if (!result.success) {
                return reply.code(500).send({
                    error: result.error,
                    message: result.message
                })
            }

            return result
        } catch (error) {
            fastify.log.error('Category search error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to search categories'
            })
        }
    })
}