import { authenticateUser, requireAdmin } from '../../middleware/auth.js'
import {
    getCategoriesSchema,
    createCategorySchema,
    updateCategorySchema,
    deleteCategorySchema,
} from '../../schemas/categorySchemas.js'

export default async function categoryAdminRoutes(fastify, options) {

    fastify.get('/', {
        preHandler: [authenticateUser, requireAdmin],
        schema: getCategoriesSchema
    }, async (request, reply) => {
        try {
            const result = await fastify.categoryService.getAllCategoriesForAdmin()

            if (!result.success) {
                return reply.code(500).send({
                    error: result.error,
                    message: result.message
                })
            }

            return result
        } catch (error) {
            fastify.log.error('Admin categories fetch error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch categories'
            })
        }
    })

    fastify.get('/stats', {
        preHandler: [authenticateUser, requireAdmin]
    }, async (request, reply) => {
        try {
            const result = await fastify.categoryService.getCategoryStats()

            if (!result.success) {
                return reply.code(500).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                stats: result.stats
            }
        } catch (error) {
            fastify.log.error('Category stats fetch error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to fetch category statistics'
            })
        }
    })

    fastify.post('/', {
        preHandler: [authenticateUser, requireAdmin],
        schema: createCategorySchema
    }, async (request, reply) => {
        try {
            const { name, description } = request.body

            const result = await fastify.categoryService.createCategory(name, description, request.user.id)

            if (!result.success) {
                const statusCode = result.error === 'Category already exists' ? 400 : 500
                return reply.code(statusCode).send({
                    error: result.error,
                    message: result.message
                })
            }

            return reply.code(201).send(result)
        } catch (error) {
            fastify.log.error('Admin category creation error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to create category'
            })
        }
    })

    fastify.put('/:categoryId', {
        preHandler: [authenticateUser, requireAdmin],
        schema: updateCategorySchema
    }, async (request, reply) => {
        try {
            const { categoryId } = request.params
            const { name, description } = request.body

            const result = await fastify.categoryService.updateCategory(categoryId, name, description)

            if (!result.success) {
                let statusCode = 500
                if (result.error === 'Category not found') statusCode = 404
                if (result.error === 'Category name already exists') statusCode = 400

                return reply.code(statusCode).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                message: result.message,
                category: result.category
            }
        } catch (error) {
            fastify.log.error('Admin category update error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to update category'
            })
        }
    })

    fastify.delete('/:categoryId', {
        preHandler: [authenticateUser, requireAdmin],
        schema: deleteCategorySchema
    }, async (request, reply) => {
        try {
            const { categoryId } = request.params

            const result = await fastify.categoryService.deleteCategory(categoryId)

            if (!result.success) {
                let statusCode = 500
                if (result.error === 'Category not found') statusCode = 404
                if (result.error === 'Category is in use') statusCode = 400

                return reply.code(statusCode).send({
                    error: result.error,
                    message: result.message
                })
            }

            return {
                success: true,
                message: result.message
            }
        } catch (error) {
            fastify.log.error('Admin category deletion error', { error: error.message })
            return reply.code(500).send({
                error: 'Internal server error',
                message: 'Unable to delete category'
            })
        }
    })

}