const db = require('../config/db');

// Obtiene el pool de conexiones
async function getWorkerPool() {
    if (!db.getDB()) {
        await db.connect();
    }
    return db.getDB();
}

exports.createWorker = async (req, res) => {
    const { name, contact_info } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'El nombre del trabajador es requerido.' });
    }

    try {
        const pool = await getWorkerPool();
        const [result] = await pool.execute(
            `INSERT INTO workers (name, contact_info, created_by_user_id) VALUES (?, ?, ?)`,
            [name, contact_info, req.user.id] // req.user.id viene del middleware de autenticación
        );

        res.status(201).json({ 
            message: 'Trabajador creado exitosamente', 
            workerId: result.insertId 
        });

    } catch (error) {
        console.error('Error al crear trabajador:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear trabajador.' });
    }
};

exports.getWorkers = async (req, res) => {
    try {
        const pool = await getWorkerPool();
        const [rows] = await pool.execute(`
            SELECT w.*, u.username as created_by_username 
            FROM workers w 
            LEFT JOIN users u ON w.created_by_user_id = u.id 
            ORDER BY w.name
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener trabajadores:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener trabajadores.' });
    }
};

exports.getWorkerById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getWorkerPool();
        const [rows] = await pool.execute(`
            SELECT w.*, u.username as created_by_username 
            FROM workers w 
            LEFT JOIN users u ON w.created_by_user_id = u.id 
            WHERE w.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Trabajador no encontrado.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error al obtener trabajador por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener trabajador.' });
    }
};

exports.updateWorker = async (req, res) => {
    const { id } = req.params;
    const { name, contact_info } = req.body;
    
    try {
        const pool = await getWorkerPool();
        const [result] = await pool.execute(
            `UPDATE workers SET name = ?, contact_info = ? WHERE id = ?`,
            [name, contact_info, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Trabajador no encontrado para actualizar.' });
        }
        
        res.status(200).json({ message: 'Trabajador actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar trabajador:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar trabajador.' });
    }
};

exports.deleteWorker = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getWorkerPool();
        
        // Verificar si el trabajador tiene tareas asignadas
        const [tasks] = await pool.execute(
            'SELECT COUNT(*) as taskCount FROM tasks WHERE assigned_to_worker_id = ?', 
            [id]
        );
        
        if (tasks[0].taskCount > 0) {
            return res.status(400).json({ 
                message: 'No se puede eliminar el trabajador porque tiene tareas asignadas.' 
            });
        }

        const [result] = await pool.execute('DELETE FROM workers WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Trabajador no encontrado para eliminar.' });
        }
        
        res.status(200).json({ message: 'Trabajador eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar trabajador:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar trabajador.' });
    }
};

// Obtener trabajadores con estadísticas de tareas
exports.getWorkersWithStats = async (req, res) => {
    try {
        const pool = await getWorkerPool();
        const [rows] = await pool.execute(`
            SELECT w.*, 
                   COUNT(t.id) as total_tasks,
                   SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
                   SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
                   SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                   SUM(CASE WHEN t.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_tasks
            FROM workers w
            LEFT JOIN tasks t ON w.id = t.assigned_to_worker_id
            GROUP BY w.id
            ORDER BY w.name
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener trabajadores con estadísticas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener estadísticas de trabajadores.' });
    }
};