// services/VehicleService.js
const pool = require('../config/db.config'); // Ensure this is imported

class VehicleService {
    
    // --- CREATE ---
    async create(vehicleData) {
        // Based on your schema: registration_number, type, color, make, fueltype, transmission, model
        const fields = ['registration_number', 'type', 'color', 'make', 'fueltype', 'transmission', 'model'];
        const placeholders = fields.map(() => '?').join(', ');
        const values = fields.map(field => vehicleData[field]);

        const query = `
            INSERT INTO Vehicles (${fields.join(', ')})
            VALUES (${placeholders});
        `;
        
        try {
            const [result] = await pool.query(query, values);
            return { vehicleId: result.insertId };
        } catch (dbError) {
            console.error('SQL Vehicle Create Failed:', dbError.message);
            throw dbError; 
        }
    }

    // --- READ (UNSCOPED) ---
    async findAll() {
        // Returns ALL vehicles to ALL admins (no WHERE clause needed)
        const query = `
           SELECT 
    V.*,
    GROUP_CONCAT(CONCAT(U.first_name, ' ', U.last_name) SEPARATOR ', ') AS assigned_users_display
FROM Vehicles V
LEFT JOIN Vehicle_Assignments VA ON V.vehicle_id = VA.vehicle_id
LEFT JOIN Users U ON VA.driver_id = U.user_id
GROUP BY V.vehicle_id;
        `;
        const [rows] = await pool.query(query);
        return rows;
    }
    
    // --- UPDATE ---
    async update(vehicleId, updateData) {
        // Dynamically build the UPDATE query
        const allowedFields = ['registration_number', 'type', 'color', 'make', 'fueltype', 'transmission', 'model'];
        const updateFields = [];
        const updateValues = [];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                updateValues.push(updateData[field]);
            }
        }

        if (updateFields.length === 0) return { affectedRows: 0 }; 

        const query = `
            UPDATE Vehicles 
            SET ${updateFields.join(', ')}
            WHERE vehicle_id = ?;
        `;
        
        updateValues.push(vehicleId); // Add the ID for the WHERE clause

        try {
            const [result] = await pool.query(query, updateValues);
            return { affectedRows: result.affectedRows };
        } catch (dbError) {
            console.error('SQL Vehicle Update Failed:', dbError.message);
            throw dbError;
        }
    }
    
    // --- DELETE (HARD DELETE with Transactional Cascade) ---
    async hardDelete(vehicleId) {
        let connection;
        try {
            // 1. Get a connection for the transaction
            connection = await pool.getConnection(); 
            await connection.beginTransaction();

            // 2. Delete dependent records first (Vehicle_Assignments)
            const deleteAssignmentsQuery = `
                DELETE FROM Vehicle_Assignments 
                WHERE vehicle_id = ?;
            `;
            await connection.query(deleteAssignmentsQuery, [vehicleId]);
            console.log(`Deleted assignments for vehicle ${vehicleId}`);

            // 3. Delete the parent record (Vehicles)
            const deleteVehicleQuery = `
                DELETE FROM Vehicles 
                WHERE vehicle_id = ?;
            `;
            const [result] = await connection.query(deleteVehicleQuery, [vehicleId]);

            // 4. Commit the transaction (save changes)
            await connection.commit();
            
            return { affectedRows: result.affectedRows }; 

        } catch (error) {
            // 5. Rollback on any error
            if (connection) {
                await connection.rollback();
            }
            console.error('SQL Transaction Failed during Vehicle Hard Delete:', error.message);
            throw error;
            
        } finally {
            // 6. Release the connection
            if (connection) {
                connection.release();
            }
        }
    }
}

module.exports = new VehicleService();