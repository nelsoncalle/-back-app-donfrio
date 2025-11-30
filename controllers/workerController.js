const db = require('../config/db');

const workerController = {
  // ✅ CREAR TRABAJADOR - USAR TABLA workers
  createWorker: (req, res) => {
    const { nombre, email, telefono } = req.body;
    
    console.log('👷 Creando trabajador:', req.body);
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    // ✅ USAR ESTRUCTURA DE TABLA workers
    const query = 'INSERT INTO workers (name, contact_info, created_by_user_id) VALUES (?, ?, ?)';
    
    db.query(query, [nombre, email || '', 1], (err, results) => { // created_by_user_id temporal = 1
      if (err) {
        console.error('Error creando trabajador:', err);
        return res.status(500).json({ error: 'Error del servidor: ' + err.message });
      }
      
      // Obtener el trabajador recién creado
      db.query('SELECT * FROM workers WHERE id = ?', [results.insertId], (err, newWorker) => {
        if (err) {
          console.error('Error obteniendo nuevo trabajador:', err);
          return res.status(500).json({ error: 'Error del servidor' });
        }
        console.log('✅ Trabajador creado:', newWorker[0]);
        res.status(201).json(newWorker[0]);
      });
    });
  },

  // ✅ OBTENER TRABAJADORES - USAR TABLA workers
  getWorkers: (req, res) => {
    const query = 'SELECT * FROM workers ORDER BY name';
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error obteniendo trabajadores:', err);
        return res.status(500).json({ error: 'Error del servidor' });
      }
      res.json(results);
    });
  },

  // ✅ OBTENER TRABAJADOR POR ID - USAR TABLA workers
  getWorkerById: (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM workers WHERE id = ?';
    
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error obteniendo trabajador:', err);
        return res.status(500).json({ error: 'Error del servidor' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Trabajador no encontrado' });
      }
      res.json(results[0]);
    });
  },

  // ✅ ACTUALIZAR TRABAJADOR - USAR TABLA workers
  updateWorker: (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono } = req.body;

    const query = 'UPDATE workers SET name = ?, contact_info = ? WHERE id = ?';
    
    db.query(query, [nombre, email, id], (err, results) => {
      if (err) {
        console.error('Error actualizando trabajador:', err);
        return res.status(500).json({ error: 'Error del servidor' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Trabajador no encontrado' });
      }
      res.json({ message: 'Trabajador actualizado correctamente' });
    });
  },

  // ✅ ELIMINAR TRABAJADOR - USAR TABLA workers
  deleteWorker: (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM workers WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error eliminando trabajador:', err);
        return res.status(500).json({ error: 'Error del servidor' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Trabajador no encontrado' });
      }
      res.json({ message: 'Trabajador eliminado correctamente' });
    });
  }
};

module.exports = workerController;