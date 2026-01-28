const pool = require('../config/db.config'); // Adjust path to your DB config


exports.getVehicleHistory = async (req, res) => {
    const { vehicle_id } = req.params;

    try {
        const [rows] = await pool.query(`
            SELECT 
                intake_id,
                customer_name,
                vehicle_plate,
                description,
                status,
                created_at
            FROM vehicle_intakes 
            WHERE vehicle_id = ? 
            ORDER BY created_at DESC`, 
            [vehicle_id]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createIntake = async (req, res) => {
    const { vehicle_id, customer_name, customer_contact, vehicle_plate, vehicle_details, description } = req.body;
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert into vehicle_intakes
        // Change your insert query line to this:
const [intakeResult] = await connection.query(
    `INSERT INTO vehicle_intakes 
    (vehicle_id, customer_name, customer_contact, vehicle_plate, vehicle_details, description) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
        (vehicle_id && vehicle_id !== 'undefined') ? vehicle_id : null, // Fix: Convert 'undefined' to null
        customer_name, 
        customer_contact || '', 
        vehicle_plate, 
        vehicle_details || '', 
        description || ''
    ]
);

        // 2. If it's a known vehicle, update its status in the main vehicles table
        if (vehicle_id) {
            await connection.query(
                "UPDATE vehicles SET status = 'In-Service' WHERE vehicle_id = ?",
                [vehicle_id]
            );
        }

        await connection.commit();
        res.status(201).json({ 
            message: "Intake recorded successfully", 
            intakeId: intakeResult.insertId 
        });

    } catch (error) {
        await connection.rollback();
        console.error("Intake Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    } finally {
        connection.release();
    }
};

exports.getAllIntakes = async (req, res) => {
    try {
        // Simple query to get all records, including the count for your dashboard
        const [rows] = await pool.query(`
            SELECT vi.*, v.make, v.model 
            FROM vehicle_intakes vi
            LEFT JOIN vehicles v ON vi.vehicle_id = v.vehicle_id
            ORDER BY vi.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.releaseVehicle = async (req, res) => {
    const { id } = req.params; // The Intake ID
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Get the vehicle_id associated with this intake
        const [intake] = await connection.query(
            "SELECT vehicle_id FROM vehicle_intakes WHERE intake_id = ?", 
            [id]
        );

        if (intake.length === 0) {
            return res.status(404).json({ message: "Record not found" });
        }

        const vehicleId = intake[0].vehicle_id;

        // 2. Update Intake Status to 'Completed'
        await connection.query(
            "UPDATE vehicle_intakes SET status = 'Completed' WHERE intake_id = ?", 
            [id]
        );

        // 3. If linked to a fleet vehicle, flip it back to 'Available'
        if (vehicleId) {
            await connection.query(
                "UPDATE vehicles SET status = 'Available' WHERE vehicle_id = ?",
                [vehicleId]
            );
        }

        await connection.commit();
        res.json({ message: "Vehicle released and status updated to Available!" });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
    
};
exports.getQuickStats = async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM vehicles) as total_fleet,
                (SELECT COUNT(*) FROM vehicles WHERE status = 'In-Service') as in_shop,
                (SELECT COUNT(*) FROM vehicle_intakes WHERE status = 'Pending') as pending_tasks,
                (SELECT COUNT(*) FROM users WHERE status = 'Active') as active_staff
        `);
        res.json(stats[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};