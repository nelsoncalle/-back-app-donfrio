const db = require('../config/db');

const workerController = {
  // ✅ CREAR TRABAJADOR - CORREGIDO para coincidir con frontend
  createWorker: (req, res) => {
    const { nombre, email, telefono } = req.body;
    
    console.log('👷 Creando trabajador con datos:', req.body);
    
    if (!nombre) {
      return res.status(400).json({ 
        success: false, 
        error: 'El nombre es requerido' 
      });
    }

    // ✅ Convertir datos del frontend a estructura de tabla
    const name = nombre;
    const contact_info = email ? `${email}${telefono ? ' | ' + telefono : ''}` : 'Sin contacto';
    
    const query = 'INSERT INTO workers (name, contact_info, created_by_user_id) VALUES (?, ?, ?)';
    
    db.query(query, [name, contact_info, 1], (err, results) => {
      if (err) {
        console.error('❌ Error en BD creando trabajador:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Error del servidor: ' + err.message 
        });
      }
      
      console.log('✅ Trabajador insertado en BD, ID:', results.insertId);
      
      // Obtener el trabajador recién creado
      db.query('SELECT * FROM workers WHERE id = ?', [results.insertId], (err, newWorker) => {
        if (err) {
          console.error('❌ Error obteniendo nuevo trabajador:', err);
          return res.status(500).json({ 
            success: false, 
            error: 'Error obteniendo datos' 
          });
        }
        
        console.log('✅ Trabajador creado exitosamente:', newWorker[0]);
        res.status(201).json({
          success: true,
          message: 'Trabajador creado exitosamente',
          worker: newWorker[0]
        });
      });
    });
  },

  // ✅ OBTENER TRABAJADORES
  getWorkers: (req, res) => {
    const query = 'SELECT * FROM workers ORDER BY name';
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('❌ Error obteniendo trabajadores:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Error del servidor' 
        });
      }
      res.json({
        success: true,
        workers: results
      });
    });
  },

  // ✅ OBTENER TRABAJADOR POR ID
  getWorkerById: (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM workers WHERE id = ?';
    
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('❌ Error obteniendo trabajador:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Error del servidor' 
        });
      }
      if (results.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Trabajador no encontrado' 
        });
      }
      res.json({
        success: true,
        worker: results[0]
      });
    });
  },

  // ✅ ACTUALIZAR TRABAJADOR
  updateWorker: (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono } = req.body;

    const contact_info = email ? `${email}${telefono ? ' | ' + telefono : ''}` : 'Sin contacto';
    const query = 'UPDATE workers SET name = ?, contact_info = ? WHERE id = ?';
    
    db.query(query, [nombre, contact_info, id], (err, results) => {
      if (err) {
        console.error('❌ Error actualizando trabajador:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Error del servidor' 
        });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Trabajador no encontrado' 
        });
      }
      res.json({ 
        success: true, 
        message: 'Trabajador actualizado correctamente' 
      });
    });
  },

  // ✅ ELIMINAR TRABAJADOR
  deleteWorker: (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM workers WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('❌ Error eliminando trabajador:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Error del servidor' 
        });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Trabajador no encontrado' 
        });
      }
      res.json({ 
        success: true, 
        message: 'Trabajador eliminado correctamente' 
      });
    });
  }
};

module.exports = workerController;