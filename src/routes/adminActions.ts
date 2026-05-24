import express from 'express';
import * as controller from '../controllers/adminActions';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { Schemas, ValidateQuery } from '../middleware/Joi';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: admin-actions
 *     description: Administrative search endpoints
 *
 * components:
 *   schemas:
 *     AdminSearchItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         email:
 *           type: string
 *         ticket_type:
 *           type: integer
 *         fac:
 *           type: string
 *         hash:
 *           type: string
 *         status:
 *           type: string
 *           enum: [enabled, disabled]
 *         consumed:
 *           type: boolean
 *         consume_time:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         pmr:
 *           type: boolean
 *         local_number:
 *           type: integer
 *           example: 0
 *     AdminSearchResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminSearchItem'
 *         total:
 *           type: integer
 *     TicketEnabledResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         status:
 *           type: string
 *           enum: [enabled, disabled]
 */

/**
 * @openapi
 * /search:
 *   get:
 *     summary: Search tickets by name, surname, email or FAC
 *     description: Returns matching entries for admin users using partial or total text matching.
 *     tags: [admin-actions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Text to search in first_name, last_name, email or fac
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           enum: [10, 25, 50]
 *         description: Maximum number of results returned when not paginating (or page size when paginating). Allowed values: 10, 25, 50
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (optional). If provided, the response will be paginated.
 *     responses:
 *       200:
 *         description: Search results returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminSearchResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (requires admin)
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.get('/search', authenticateToken, authorizeRoles('admin'), ValidateQuery(Schemas.AdminActions.searchQuery), controller.search);

/**
 * @openapi
 * /tickets/{id}/change-enabled:
 *   patch:
 *     summary: Toggle a ticket enabled status
 *     description: Allows an admin user to switch a ticket between enabled and disabled.
 *     tags: [admin-actions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket MongoDB id
 *     responses:
 *       200:
 *         description: Ticket status updated successfully
 *       400:
 *         description: Invalid ticket id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (requires admin)
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.patch('/tickets/:id/change-enabled', authenticateToken, authorizeRoles('admin'), controller.changeEnabled);

export default router;