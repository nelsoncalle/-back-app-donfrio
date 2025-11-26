const db = require('../config/db');

const workerController = {
  // Crear un nuevo trabajador
  createWorker: async (req, res) => {
    try {
      const { name, contact_info } = req.body;
      const created_by_user_id = req.user.id; // Del middleware de autenticación
      
      if (!name) {
        return res.status(400).json({ 
          error: 'El nombre es requerido' 
        });
      }

      const query = `
        INSERT INTO workers (name, contact_info, created_by_user_id) 
        VALUES (?, ?, ?)
      `;
      
      const [result] = await db.promise().execute(
        query, 
        [name, contact_info, created_by_user_id]
      );

      res.status(201).json({
        message: 'Trabajador creado exitosamente',
        workerId: result.insertId,
        worker: {
          id: result.insertId,
          name,
          contact_info,
          created_by_user_id
        }
      });
    } catch (error) {
      console.error('Error creando trabajador:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Obtener todos los trabajadores
  getWorkers: async (req, res) => {
    try {
      const query = `
        SELECT w.*, u.username as created_by 
        FROM workers w
        LEFT JOIN users u ON w.created_by_user_id = u.id
        ORDER BY w.name ASC
      `;
      
      const [workers] = await db.promise().execute(query);
      
      res.json({
        message: 'Trabajadores obtenidos exitosamente',
        count: workers.length,
        workers
      });
    } catch (error) {
      console.error('Error obteniendo trabajadores:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Obtener un trabajador por ID
  getWorkerById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT w.*, u.username as created_by 
        FROM workers w
        LEFT JOIN users u ON w.created_by_user_id = u.id
        WHERE w.id = ?
      `;
      
      const [workers] = await db.promise().execute(query, [id]);
      
      if (workers.length === 0) {
        return res.status(404).json({ 
          error: 'Trabajador no encontrado' 
        });
      }
      
      res.json({
        message: 'Trabajador obtenido exitosamente',
        worker: workers[0]
      });
    } catch (error) {
      console.error('Error obteniendo trabajador:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Actualizar un trabajador
  updateWorker: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, contact_info } = req.body;
      
      // Verificar si el trabajador existe
      const checkQuery = 'SELECT id FROM workers WHERE id = ?';
      const [existingWorkers] = await db.promise().execute(checkQuery, [id]);
      
      if (existingWorkers.length === 0) {
        return res.status(404).json({ 
          error: 'Trabajador no encontrado' 
        });
      }

      const updateQuery = `
        UPDATE workers 
        SET name = ?, contact_info = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      await db.promise().execute(updateQuery, [name, contact_info, id]);

      res.json({
        message: 'Trabajador actualizado exitosamente',
        worker: {
          id: parseInt(id),
          name,
          contact_info
        }
      });
    } catch (error) {
      console.error('Error actualizando trabajador:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Eliminar un trabajador
  deleteWorker: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si el trabajador existe
      const checkQuery = 'SELECT id FROM workers WHERE id = ?';
      const [existingWorkers] = await db.promise().execute(checkQuery, [id]);
      
      if (existingWorkers.length === 0) {
        return res.status(404).json({ 
          error: 'Trabajador no encontrado' 
        });
      }

      // Verificar si el trabajador tiene tareas asignadas
      const tasksQuery = 'SELECT id FROM tasks WHERE assigned_to_worker_id = ?';
      const [tasks] = await db.promise().execute(tasksQuery, [id]);
      
      if (tasks.length > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el trabajador porque tiene tareas asignadas' 
        });
      }

      const deleteQuery = 'DELETE FROM workers WHERE id = ?';
      await db.promise().execute(deleteQuery, [id]);

      res.json({
        message: 'Trabajador eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando trabajador:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  // Obtener trabajadores con estadísticas de tareas
  getWorkersWithStats: async (req, res) => {
    try {
      const query = `
        SELECT 
          w.id,
          w.name,
          w.contact_info,
          COUNT(t.id) as total_tasks,
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
          SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
          SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks
        FROM workers w
        LEFT JOIN tasks t ON w.id = t.assigned_to_worker_id
        GROUP BY w.id, w.name, w.contact_info
        ORDER BY w.name ASC
      `;
      
      const [workers] = await db.promise().execute(query);
      
      // Calcular porcentajes
      const workersWithStats = workers.map(worker => ({
        ...worker,
        completion_rate: worker.total_tasks > 0 
          ? Math.round((worker.completed_tasks / worker.total_tasks) * 100) 
          : 0
      }));
      
      res.json({
        message: 'Estadísticas de trabajadores obtenidas exitosamente',
        count: workersWithStats.length,
        workers: workersWithStats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de trabajadores:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  }
};

module.exports = workerController;