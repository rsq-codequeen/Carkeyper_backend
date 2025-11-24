const pool = require('../config/db.config'); 
const ChecklistFactory = require('../utilities/ChecklistFactory'); 

class ChecklistService {

    // --- 1. CREATE (POST /api/checklists) ---
    async create(rawData) {
        let connection;
        try {
            const templateData = ChecklistFactory.createTemplate(rawData);
            const itemsData = ChecklistFactory.createItems(rawData.items);

            connection = await pool.getConnection();
            await connection.beginTransaction();

            // 1. Insert Template
            const templateQuery = `
                INSERT INTO Checklist_Templates 
                (title, description, assigned_vehicle, checklist_time) 
                VALUES (?, ?, ?, ?)
            `;
            const [templateResult] = await connection.query(templateQuery, [
                templateData.title,
                templateData.description,
                templateData.assigned_vehicle,
                templateData.checklist_time,
            ]);
            const templateId = templateResult.insertId; 

            // 2. Insert Items
            if (itemsData.length > 0) {
                const itemValues = itemsData.map(item => [
                    templateId,
                    item.text,
                    item.sort_order, 
                    item.requires_ok 
                ]);

                const itemsQuery = `
                    INSERT INTO Checklist_Items 
                    (template_id, item_text, sort_order, requires_ok) 
                    VALUES ?
                `;
                await connection.query(itemsQuery, [itemValues]);
            }

            await connection.commit();
            return { templateId };

        } catch (dbError) {
            if (connection) await connection.rollback();
            console.error('SQL Transaction Failed during Checklist Create:', dbError.message);
            throw dbError; 
        } finally {
            if (connection) connection.release();
        }
    }

    // --- 2. READ ALL (GET /api/checklists) ---
    async findAll() {
        try {
            const query = `
                SELECT 
                    template_id, 
                    title, 
                    checklist_time, 
                    assigned_vehicle 
                FROM Checklist_Templates 
                ORDER BY template_id DESC;
            `;
            const [rows] = await pool.query(query);
            return rows;
        } catch (dbError) {
            console.error('SQL Error in findAll():', dbError.message);
            throw dbError;
        }
    }

    // --- 3. READ ONE FOR EDIT (GET /api/checklists/:id) ---
    /**
     * Fetches a single checklist template along with all its associated items.
     * @param {number} templateId - The ID of the template to retrieve.
     */
    async findById(templateId) {
        // 3a. Fetch the Template Header
        const templateQuery = `
            SELECT 
                template_id, 
                title, 
                description, 
                assigned_vehicle, 
                checklist_time 
            FROM Checklist_Templates 
            WHERE template_id = ?;
        `;
        const [templateRows] = await pool.query(templateQuery, [templateId]);
        
        if (templateRows.length === 0) return null;
        const template = templateRows[0];

        // 3b. Fetch the Checklist Items
        // We select the item_text and requires_ok, and use sort_order to ensure order.
        const itemsQuery = `
            SELECT 
                item_text AS text, 
                requires_ok 
            FROM Checklist_Items 
            WHERE template_id = ? 
            ORDER BY sort_order ASC;
        `;
        const [itemRows] = await pool.query(itemsQuery, [templateId]);

        // 3c. Combine into a single object for the frontend
        return {
            ...template,
            items: itemRows
        };
    }

    // --- 4. UPDATE (PUT /api/checklists/:id) ---
    /**
     * Updates an existing checklist template and replaces all its items in a single transaction.
     * @param {number} templateId - The ID of the template to update.
     * @param {object} rawData - The updated checklist data from the frontend.
     */
    async update(templateId, rawData) {
        let connection;
        try {
            // 1. Use the Factory for validation and structure
            const templateData = ChecklistFactory.createTemplate(rawData);
            const itemsData = ChecklistFactory.createItems(rawData.items);

            connection = await pool.getConnection();
            await connection.beginTransaction(); // Start transaction

            // 2. Update Checklist_Templates (Header)
            const updateTemplateQuery = `
                UPDATE Checklist_Templates SET 
                title = ?, description = ?, assigned_vehicle = ?, checklist_time = ?
                WHERE template_id = ?
            `;
            const [templateResult] = await connection.query(updateTemplateQuery, [
                templateData.title, 
                templateData.description, 
                templateData.assigned_vehicle, 
                templateData.checklist_time, 
                templateId
            ]);

            // 3. Delete ALL old items associated with this template ID
            // This is the clean way to handle item additions, removals, and reordering.
            await connection.query(`DELETE FROM Checklist_Items WHERE template_id = ?`, [templateId]);

            // 4. Insert ALL new/updated items
            if (itemsData.length > 0) {
                const itemValues = itemsData.map(item => [
                    templateId,
                    item.text,
                    item.sort_order, // Sort order is re-established by the factory/array index
                    item.requires_ok
                ]);
                await connection.query(`
                    INSERT INTO Checklist_Items 
                    (template_id, item_text, sort_order, requires_ok) 
                    VALUES ?
                `, [itemValues]);
            }
            
            await connection.commit(); // Commit all changes
            return { affectedRows: templateResult.affectedRows };

        } catch (dbError) {
            if (connection) await connection.rollback(); // Rollback on any error
            console.error('SQL Transaction Failed during Checklist Update:', dbError.message);
            throw dbError;
        } finally {
            if (connection) connection.release();
        }
    }

    // --- 5. DELETE (DELETE /api/checklists/:id) ---
    /**
     * Permanently deletes a checklist template. Items are deleted via ON DELETE CASCADE.
     * @param {number} templateId - The ID of the template to delete.
     */
    async hardDelete(templateId) {
        // Since we established ON DELETE CASCADE on the foreign key, 
        // deleting the parent record is sufficient and ensures atomicity.
        const query = `
            DELETE FROM Checklist_Templates 
            WHERE template_id = ?;
        `;
        const [result] = await pool.query(query, [templateId]);
        return { affectedRows: result.affectedRows };
    }
}

module.exports = new ChecklistService();