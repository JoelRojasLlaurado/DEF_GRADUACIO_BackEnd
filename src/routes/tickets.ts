import express from 'express';
import * as controller from '../controllers/Ticket';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { Schemas, ValidateQuery } from '../middleware/Joi';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: tickets
 *     description: Ticket search endpoints
 *
 * components:
 *   schemas:
 *     TicketDetail:
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
 *         pmr:
 *           type: boolean
 *         hash:
 *           type: string
 *         fac:
 *           type: string
 *         local_number:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [enabled, disabled]
 *         consumed:
 *           type: boolean
 *         consume_time:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TicketSearchItem:
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
 *     TicketSearchResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TicketSearchItem'
 *         total:
 *           type: integer
 */

/**
 * @openapi
 * /tickets/search:
 *   get:
 *     summary: Search tickets by name, surname, email, FAC or hash
 *     description: Returns a short list of tickets for admin selection screens.
 *     tags: [tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Text to search in first_name, last_name, email, fac or hash
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: Maximum number of results returned
 *     responses:
 *       200:
 *         description: Search results returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketSearchResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (requires admin)
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.get('/tickets/search', authenticateToken, authorizeRoles('admin'), ValidateQuery(Schemas.Tickets.searchQuery), controller.search);

/**
 * @openapi
 * /tickets/{hash}:
 *   get:
 *     summary: Get one exact ticket by hash
 *     description: Returns the full ticket detail without creating a scan record.
 *     tags: [tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Exact ticket hash
 *     responses:
 *       200:
 *         description: Ticket returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (requires admin)
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.get('/tickets/:hash', authenticateToken, authorizeRoles('admin'), controller.getByHash);

export default router;
