import express from 'express';
import * as controller from '../controllers/Scan';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { Schemas, ValidateJoi, ValidateQuery } from '../middleware/Joi';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: scan
 *     description: Ticket scan actions (enter, verify, exit)
 *
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *           example: "Joel"
 *         last_name:
 *           type: string
 *           example: "Rojas"
 *         email:
 *           type: string
 *           format: email
 *           example: "joel@example.com"
 *         ticket_type:
 *           type: integer
 *           enum: [0, 1, 2, 3, 4]
 *           description: "0=organizacion, 1=profesor, 2=autoridad, 3=estudiante, 4=invitado"
 *           example: 3
 *         pmr:
 *           type: boolean
 *           example: false
 *         hash:
 *           type: string
 *           example: "8f43a2f81f574fc6a3c4d774b72fb0f1f8fd5f8afcd8d24c"
 *         fac:
 *           type: string
 *           example: "A1B2C3"
 *         local_number:
 *           type: integer
 *           example: 0
 *         consumed:
 *           type: boolean
 *           example: true
 *         consume_time:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-04-19T10:35:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-04-19T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-04-19T10:35:00.000Z"
 *
 *     ScanActionRequest:
 *       type: object
 *       required:
 *         - hash
 *       properties:
 *         hash:
 *           type: string
 *           description: Unique long ticket identifier
 *           example: "8f43a2f81f574fc6a3c4d774b72fb0f1f8fd5f8afcd8d24c"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "El ticket ya fue consumido previamente"
 *
 *     ScanHistoryItem:
 *       type: object
 *       properties:
 *         scan_id:
 *           type: string
 *           example: "6803d5b0fbf30be7628e8e5f"
 *         action:
 *           type: string
 *           enum: [ENTER, VERIFY, EXIT]
 *           example: "VERIFY"
 *         hash:
 *           type: string
 *           example: "8f43a2f81f574fc6a3c4d774b72fb0f1f8fd5f8afcd8d24c"
 *         staff_db_id:
 *           type: string
 *           example: "69e4fcddab82b16fc513a508"
 *         time:
 *           type: string
 *           format: date-time
 *           example: "2026-04-19T16:03:41.243Z"
 *
 *     ScanHistoryResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ScanHistoryItem'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 25
 *             total:
 *               type: integer
 *               example: 1200
 *             totalPages:
 *               type: integer
 *               example: 48
 */

/**
 * @openapi
 * /scan:
 *   get:
 *     summary: Get scan actions history (admin/moderator)
 *     tags: [scan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           enum: [10, 25, 50, 75, 100]
 *         description: Page size
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: History returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScanHistoryResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (requires admin or moderator)
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.get('/scan', authenticateToken, authorizeRoles('admin', 'moderator'), ValidateQuery(Schemas.Scan.listQuery), controller.history);

/**
 * @openapi
 * /enter:
 *   post:
 *     summary: Consume a ticket and register ENTER scan
 *     description: Marks a ticket as consumed=true, sets consume_time and stores a scan action ENTER.
 *     tags: [scan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScanActionRequest'
 *     responses:
 *       200:
 *         description: Ticket consumed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (requires admin or desk)
 *       404:
 *         description: Ticket not found
 *       409:
 *         description: Ticket already consumed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/enter', authenticateToken, authorizeRoles('admin', 'desk'), ValidateJoi(Schemas.Scan.action), controller.enter);

/**
 * @openapi
 * /verify:
 *   post:
 *     summary: Verify ticket status without consuming it
 *     description: Returns current ticket data and stores a scan action VERIFY.
 *     tags: [scan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScanActionRequest'
 *     responses:
 *       200:
 *         description: Ticket verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (requires admin, moderator or desk)
 *       404:
 *         description: Ticket not found
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/verify', authenticateToken, authorizeRoles('admin', 'moderator', 'desk'), ValidateJoi(Schemas.Scan.action), controller.verify);

/**
 * @openapi
 * /exit:
 *   post:
 *     summary: Reopen a consumed ticket and register EXIT scan
 *     description: If ticket is consumed=true, sets consumed=false and consume_time=null, then stores EXIT scan.
 *     tags: [scan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScanActionRequest'
 *     responses:
 *       200:
 *         description: Ticket exit processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (requires admin or moderator)
 *       404:
 *         description: Ticket not found
 *       409:
 *         description: Ticket was not consumed, cannot exit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/exit', authenticateToken, authorizeRoles('admin', 'moderator'), ValidateJoi(Schemas.Scan.action), controller.exit);

export default router;
