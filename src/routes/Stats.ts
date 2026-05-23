import express from 'express';
import * as controller from '../controllers/Stats';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: stats
 *     description: Public statistics endpoints
 *
 * components:
 *   schemas:
 *     TicketStats:
 *       type: object
 *       properties:
 *         total_tickets:
 *           type: integer
 *           example: 1200
 *         used_tickets:
 *           type: integer
 *           example: 746
 *         by_ticket_type:
 *           type: object
 *           properties:
 *             "0":
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 50
 *                 used:
 *                   type: integer
 *                   example: 35
 *             "1":
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 120
 *                 used:
 *                   type: integer
 *                   example: 98
 *             "2":
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 30
 *                 used:
 *                   type: integer
 *                   example: 21
 *             "3":
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 900
 *                 used:
 *                   type: integer
 *                   example: 560
 *             "4":
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 used:
 *                   type: integer
 *                   example: 32
 */

/**
 * @openapi
 * /stats:
 *   get:
 *     summary: Public ticket statistics
 *     description: Returns total tickets and used tickets globally and split by ticket_type.
 *     tags: [stats]
 *     responses:
 *       200:
 *         description: Statistics generated correctly
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketStats'
 *       500:
 *         description: Internal server error
 */
router.get('/stats', controller.stats);

export default router;
