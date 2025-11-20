const db = require('../config/db');

// Obtiene el pool de conexiones
async function getTaskPool() {
    if (!db.getDB()) {
        await db.connect();
    }
    return db.getDB();
}

exports.createTask = async (req, res) => {
    const { title, description, due_date, assigned_to_worker_id, image_url } = req.body;

    if (!title || !assigned_to_worker_id) {
        return res.status(400).json({ 
            message: 'El título de la tarea y el ID del trabajador son requeridos.' 
        });
    }

    try {
        const pool = await getTaskPool();
        
        // Verificar que el trabajador existe
        const [workerRows] = await pool.execute('SELECT id FROM workers WHERE id = ?', [assigned_to_worker_id]);
        if (workerRows.length === 0) {
            return res.status(404).json({ message: 'Trabajador no encontrado.' });
        }

        const [result] = await pool.execute(
            `INSERT INTO tasks (title, description, due_date, assigned_to_worker_id, created_by_user_id, image_url) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, description, due_date, assigned_to_worker_id, req.user.id, image_url]
        );

        res.status(201).json({ 
            message: 'Tarea creada exitosamente', 
            taskId: result.insertId 
        });

    } catch (error) {
        console.error('Error al crear tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear tarea.' });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const pool = await getTaskPool();
        const [rows] = await pool.execute(`
            SELECT t.*, 
                   w.name as worker_name, 
                   w.contact_info as worker_contact,
                   u.username as created_by_username
            FROM tasks t
            LEFT JOIN workers w ON t.assigned_to_worker_id = w.id
            LEFT JOIN users u ON t.created_by_user_id = u.id
            ORDER BY t.created_at DESC
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener tareas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener tareas.' });
    }
};

exports.getTaskById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getTaskPool();
        const [rows] = await pool.execute(`
            SELECT t.*, 
                   w.name as worker_name, 
                   w.contact_info as worker_contact,
                   u.username as created_by_username
            FROM tasks t
            LEFT JOIN workers w ON t.assigned_to_worker_id = w.id
            LEFT JOIN users u ON t.created_by_user_id = u.id
            WHERE t.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error al obtener tarea por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener tarea.' });
    }
};

exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, status, due_date, assigned_to_worker_id, image_url } = req.body;
    
    try {
        const pool = await getTaskPool();
        
        // Si se cambia el trabajador, verificar que existe
        if (assigned_to_worker_id) {
            const [workerRows] = await pool.execute('SELECT id FROM workers WHERE id = ?', [assigned_to_worker_id]);
            if (workerRows.length === 0) {
                return res.status(404).json({ message: 'Trabajador no encontrado.' });
            }
        }

        const [result] = await pool.execute(
            `UPDATE tasks 
             SET title = ?, description = ?, status = ?, due_date = ?, 
                 assigned_to_worker_id = ?, image_url = ?
             WHERE id = ?`,
            [title, description, status, due_date, assigned_to_worker_id, image_url, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada para actualizar.' });
        }
        
        res.status(200).json({ message: 'Tarea actualizada exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar tarea.' });
    }
};

exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getTaskPool();
        const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada para eliminar.' });
        }
        
        res.status(200).json({ message: 'Tarea eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar tarea.' });
    }
};

// Obtener tareas por trabajador
exports.getTasksByWorker = async (req, res) => {
    const { workerId } = req.params;
    try {
        const pool = await getTaskPool();
        const [rows] = await pool.execute(`
            SELECT t.*, w.name as worker_name
            FROM tasks t
            LEFT JOIN workers w ON t.assigned_to_worker_id = w.id
            WHERE t.assigned_to_worker_id = ?
            ORDER BY t.created_at DESC
        `, [workerId]);
        
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener tareas por trabajador:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener tareas del trabajador.' });
    }
};

// Obtener tareas por estado
exports.getTasksByStatus = async (req, res) => {
    const { status } = req.params;
    
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Estado de tarea no válido.' });
    }
    
    try {
        const pool = await getTaskPool();
        const [rows] = await pool.execute(`
            SELECT t.*, w.name as worker_name, w.contact_info as worker_contact
            FROM tasks t
            LEFT JOIN workers w ON t.assigned_to_worker_id = w.id
            WHERE t.status = ?
            ORDER BY t.due_date ASC
        `, [status]);
        
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener tareas por estado:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener tareas por estado.' });
    }
};

// Actualizar estado de una tarea
exports.updateTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Estado de tarea no válido.' });
    }

    try {
        const pool = await getTaskPool();
        const [result] = await pool.execute(
            'UPDATE tasks SET status = ? WHERE id = ?',
            [status, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada para actualizar estado.' });
        }
        
        res.status(200).json({ message: `Estado de tarea actualizado a: ${status}` });
    } catch (error) {
        console.error('Error al actualizar estado de tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar estado de tarea.' });
    }
};

// Actualizar imagen de una tarea
exports.updateTaskImage = async (req, res) => {
    const { id } = req.params;
    const { image_url } = req.body;

    if (!image_url) {
        return res.status(400).json({ message: 'La URL de la imagen es requerida.' });
    }

    try {
        const pool = await getTaskPool();
        const [result] = await pool.execute(
            'UPDATE tasks SET image_url = ? WHERE id = ?',
            [image_url, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada para actualizar imagen.' });
        }
        
        res.status(200).json({ message: 'Imagen de tarea actualizada exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar imagen de tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar imagen de tarea.' });
    }
};

// Obtener estadísticas de tareas
exports.getTaskStats = async (req, res) => {
    try {
        const pool = await getTaskPool();
        const [rows] = await pool.execute(`
            SELECT 
                COUNT(*) as total_tasks,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_tasks,
                SUM(CASE WHEN due_date < NOW() AND status != 'completed' THEN 1 ELSE 0 END) as overdue_tasks
            FROM tasks
        `);
        
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error al obtener estadísticas de tareas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener estadísticas de tareas.' });
    }
};