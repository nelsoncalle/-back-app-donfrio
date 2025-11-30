const db = require('../config/db');

const taskController = {
  // ✅ GET ALL TASKS - USAR TABLA tasks
  getTasks: (req, res) => {
    const query = 'SELECT * FROM tasks ORDER BY created_at DESC';
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error obteniendo tareas:', err);
        return res.status(500).json({ error: 'Error del servidor' });
      }
      res.json(results);
    });
  },

  // ✅ CREATE TASK - USAR TABLA tasks
  createTask: (req, res) => {
    const { titulo, descripcion, id_trabajador, estado, fecha_limite, id_usuario } = req.body;
    
    console.log('📝 Creando tarea:', req.body);
    
    if (!titulo) {
      return res.status(400).json({ error: 'El título es requerido' });
    }

    // ✅ USAR ESTRUCTURA DE TABLA tasks
    const query = `
      INSERT INTO tasks (title, description, assigned_to_worker_id, status, due_date, created_by_user_id) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      titulo, // → title
      descripcion || '', // → description  
      id_trabajador || null, // → assigned_to_worker_id
      estado || 'pending', // → status (usar estados en inglés)
      fecha_limite || null, // → due_date
      id_usuario || 1 // → created_by_user_id (temporal = 1)
    ];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error creando tarea:', err);
        return res.status(500).json({ error: 'Error del servidor: ' + err.message });
      }
      
      // Obtener la tarea recién creada
      db.query('SELECT * FROM tasks WHERE id = ?', [results.insertId], (err, newTask) => {
        if (err) {
          console.error('Error obteniendo nueva tarea:', err);
          return res.status(500).json({ error: 'Error del servidor' });
        }
        console.log('✅ Tarea creada:', newTask[0]);
        res.status(201).json(newTask[0]);
      });
    });
  },

  // ✅ UPDATE TASK - USAR TABLA tasks
  updateTask: (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, id_trabajador, estado, fecha_limite, id_usuario } = req.body;

    const query = `
      UPDATE tasks 
      SET title = ?, description = ?, assigned_to_worker_id = ?, status = ?, due_date = ?, created_by_user_id = ?
      WHERE id = ?
    `;
    
    const values = [
      titulo, // → title
      descripcion, // → description
      id_trabajador, // → assigned_to_worker_id  
      estado, // → status
      fecha_limite, // → due_date
      id_usuario || 1, // → created_by_user_id
      id
    ];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error actualizando tarea:', err);
        return res.status(500).json({ error: 'Error del servidor' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      res.json({ message: 'Tarea actualizada correctamente' });
    });
  },

  // ✅ ELIMINAR TAREA - USAR TABLA tasks
  deleteTask: (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM tasks WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error eliminando tarea:', err);
        return res.status(500).json({ error: 'Error del servidor' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      res.json({ message: 'Tarea eliminada correctamente' });
    });
  },

  // ✅ MÉTODOS ADICIONALES - USAR TABLA tasks
  getTasksByWorker: (req, res) => {
    const { workerId } = req.params;
    const query = 'SELECT * FROM tasks WHERE assigned_to_worker_id = ? ORDER BY created_at DESC';
    
    db.query(query, [workerId], (err, results) => {
      if (err) {
        console.error('Error obteniendo tareas por trabajador:', err);
        return res.status(500).json({ error: 'Error del servidor' });
      }
      res.json(results);
    });
  },

  getTasksByStatus: (req, res) => {
    const { status } = req.params;
    const query = 'SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC';
    
    db.query(query, [status], (err, results) => {
      if (err) {
        console.error('Error obteniendo tareas por estado:', err);
        return res.status(500).json({ error: 'Error del servidor' });
      }
      res.json(results);
    });
  }
};

module.exports = taskController;