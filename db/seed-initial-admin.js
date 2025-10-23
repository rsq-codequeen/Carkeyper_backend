
const bcrypt = require('bcryptjs');
const pool = require('../config/db.config'); 

(async () => {
    const adminEmail = 'rida@carkeyper.com'; 
    const adminPassword = 'TemporaryAdminPassword123!'; 
    const roleIdAdmin = 1; 
    
    console.log(`Starting Admin seed for: ${adminEmail}`);
    
    try {
      
        const [existingUsers] = await pool.query(
            'SELECT user_id FROM Users WHERE email = ?',
            [adminEmail]
        );

        if (existingUsers.length > 0) {
            console.warn(`⚠️ Admin user with email ${adminEmail} already exists. Skipping seed.`);
            return;
        }

       
        const hashed_password = await bcrypt.hash(adminPassword, 10);
        
      
        const query = `
            INSERT INTO Users(first_name, last_name, email, password_hash, role_id, is_active, force_password_change) 
            VALUES ('Iqra', 'Basharat', ?, ?, ?, 1, 1);
        `;
        
        await pool.query(query, [adminEmail, hashed_password, roleIdAdmin]);
        
        console.log('✅ Admin user successfully seeded.');
        console.log(`Initial Admin Password: ${adminPassword}`);
        
    } catch (error) {
       
        console.error(' FATAL: Database seeding failed:', error);
        
    } finally {
     
        if (pool && pool.end) {
             pool.end();
        }
    }
})();