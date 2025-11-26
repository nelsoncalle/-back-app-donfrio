const db = require('../config/db');

const taskController = {
  // Crear una nueva tarea
  createTask: async (req, res) => {
    try {
      const { title, description, status, due_date, assigned_to_worker_id, image_url } = req.body;
      const created_by_user_id = req.user.id; // Del middleware de autenticación
      
      if (!title) {
        return res.status(400).json({ 
          error: 'El título es requerido' 
        });
      }

      const query = `
        INSERT INTO tasks (title, description, status, due_date, assigned_to_worker_id, created_by_user_id, image_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.promise().execute(
        query, 
        [title, description, status || 'pending', due_date, assigned_to_worker_id, created_by_user_id, image_url]
      );

      res.status(201).json({
        message: 'Tarea creada exitosamente',
        taskId: result.insertId,
        task: {
          id: result.insertId,
          title,
          description,
          status: status || 'pending',
          due_date,
          assigned_to_worker_id,
          created_by_user_id,
          image_url
        }
      });
    } catch (error) {
      console.error('Error creando tarea:', error);
      
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
          error: 'El trabajador especificado no existe' 
        });
      }
      
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Obtener todas las tareas
  getTasks: async (req, res) => {
    try {
      const query = `
        SELECT 
          t.*,
          w.name as worker_name,
          w.contact_info as worker_contact,
          u.username as created_by_username
        FROM tasks t
        LEFT JOIN workers w ON t.assigned_to_worker_id = w.id
        LEFT JOIN users u ON t.created_by_user_id = u.id
        ORDER BY t.created_at DESC
      `;
      
      const [tasks] = await db.promise().execute(query);
      
      res.json({
        message: 'Tareas obtenidas exitosamente',
        count: tasks.length,
        tasks
      });
    } catch (error) {
      console.error('Error obteniendo tareas:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Obtener una tarea por ID
  getTaskById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT 
          t.*,
          w.name as worker_name,
          w.contact_info as worker_contact,
          u.username as created_by_username
        FROM tasks t
        LEFT JOIN workers w ON t.assigned_to_worker_id = w.id
        LEFT JOIN users u ON t.created_by_user_id = u.id
        WHERE t.id = ?
      `;
      
      const [tasks] = await db.promise().execute(query, [id]);
      
      if (tasks.length === 0) {
        return res.status(404).json({ 
          error: 'Tarea no encontrada' 
        });
      }
      
      res.json({
        message: 'Tarea obtenida exitosamente',
        task: tasks[0]
      });
    } catch (error) {
      console.error('Error obteniendo tarea:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Actualizar una tarea
  updateTask: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, status, due_date, assigned_to_worker_id, image_url } = req.body;
      
      // Verificar si la tarea existe
      const checkQuery = 'SELECT id FROM tasks WHERE id = ?';
      const [existingTasks] = await db.promise().execute(checkQuery, [id]);
      
      if (existingTasks.length === 0) {
        return res.status(404).json({ 
          error: 'Tarea no encontrada' 
        });
      }

      const updateQuery = `
        UPDATE tasks 
        SET title = ?, description = ?, status = ?, due_date = ?, 
            assigned_to_worker_id = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      await db.promise().execute(
        updateQuery, 
        [title, description, status, due_date, assigned_to_worker_id, image_url, id]
      );

      res.json({
        message: 'Tarea actualizada exitosamente',
        task: {
          id: parseInt(id),
          title,
          description,
          status,
          due_date,
          assigned_to_worker_id,
          image_url
        }
      });
    } catch (error) {
      console.error('Error actualizando tarea:', error);
      
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
          error: 'El trabajador especificado no existe' 
        });
      }
      
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Eliminar una tarea
  deleteTask: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si la tarea existe
      const checkQuery = 'SELECT id FROM tasks WHERE id = ?';
      const [existingTasks] = await db.promise().execute(checkQuery, [id]);
      
      if (existingTasks.length === 0) {
        return res.status(404).json({ 
          error: 'Tarea no encontrada' 
        });
      }

      const deleteQuery = 'DELETE FROM tasks WHERE id = ?';
      await db.promise().execute(deleteQuery, [id]);

      res.json({
        message: 'Tarea eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando tarea:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Obtener tareas por trabajador
  getTasksByWorker: async (req, res) => {
    try {
      const { workerId } = req.params;
      
      const query = `
        SELECT 
          t.*,
          w.name as worker_name
        FROM tasks t
        LEFT JOIN workers w ON t.assigned_to_worker_id = w.id
        WHERE t.assigned_to_worker_id = ?
        ORDER BY t.created_at DESC
      `;
      
      const [tasks] = await db.promise().execute(query, [workerId]);
      
      res.json({
        message: `Tareas del trabajador ${workerId} obtenidas exitosamente`,
        count: tasks.length,
        tasks
      });
    } catch (error) {
      console.error('Error obteniendo tareas por trabajador:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Obtener tareas por estado
  getTasksByStatus: async (req, res) => {
    try {
      const { status } = req.params;
      
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: 'Estado no válido. Use: pending, in_progress, completed, cancelled' 
        });
      }

      const query = `
        SELECT 
          t.*,
          w.name as worker_name
        FROM tasks t
        LEFT JOIN workers w ON t.assigned_to_worker_id = w.id
        WHERE t.status = ?
        ORDER BY t.created_at DESC
      `;
      
      const [tasks] = await db.promise().execute(query, [status]);
      
      res.json({
        message: `Tareas con estado ${status} obtenidas exitosamente`,
        count: tasks.length,
        tasks
      });
    } catch (error) {
      console.error('Error obteniendo tareas por estado:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Actualizar estado de una tarea
  updateTaskStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ 
          error: 'El estado es requerido' 
        });
      }

      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: 'Estado no válido. Use: pending, in_progress, completed, cancelled' 
        });
      }

      // Verificar si la tarea existe
      const checkQuery = 'SELECT id FROM tasks WHERE id = ?';
      const [existingTasks] = await db.promise().execute(checkQuery, [id]);
      
      if (existingTasks.length === 0) {
        return res.status(404).json({ 
          error: 'Tarea no encontrada' 
        });
      }

      const updateQuery = 'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await db.promise().execute(updateQuery, [status, id]);

      res.json({
        message: `Estado de tarea actualizado a ${status}`,
        task: {
          id: parseInt(id),
          status
        }
      });
    } catch (error) {
      console.error('Error actualizando estado de tarea:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Actualizar imagen de una tarea
  updateTaskImage: async (req, res) => {
    try {
      const { id } = req.params;
      const { image_url } = req.body;
      
      if (!image_url) {
        return res.status(400).json({ 
          error: 'La URL de la imagen es requerida' 
        });
      }

      // Verificar si la tarea existe
      const checkQuery = 'SELECT id FROM tasks WHERE id = ?';
      const [existingTasks] = await db.promise().execute(checkQuery, [id]);
      
      if (existingTasks.length === 0) {
        return res.status(404).json({ 
          error: 'Tarea no encontrada' 
        });
      }

      const updateQuery = 'UPDATE tasks SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await db.promise().execute(updateQuery, [image_url, id]);

      res.json({
        message: 'Imagen de tarea actualizada exitosamente',
        task: {
          id: parseInt(id),
          image_url
        }
      });
    } catch (error) {
      console.error('Error actualizando imagen de tarea:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Obtener estadísticas de tareas
  getTaskStats: async (req, res) => {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_tasks,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_tasks,
          SUM(CASE WHEN due_date < CURDATE() AND status != 'completed' THEN 1 ELSE 0 END) as overdue_tasks
        FROM tasks
      `;
      
      const [stats] = await db.promise().execute(query);
      
      const statistics = stats[0];
      
      // Calcular porcentajes
      statistics.completion_rate = statistics.total_tasks > 0 
        ? Math.round((statistics.completed_tasks / statistics.total_tasks) * 100) 
        : 0;
      
      statistics.overdue_rate = statistics.total_tasks > 0 
        ? Math.round((statistics.overdue_tasks / statistics.total_tasks) * 100) 
        : 0;

      res.json({
        message: 'Estadísticas de tareas obtenidas exitosamente',
        statistics
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de tareas:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  }
};

module.exports = taskController;