// controllers/workerController.js - VERSIÓN CORRECTA
const db = require('../config/db');

// 1. Función para crear trabajador
const createWorker = async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;
    
    console.log('📥 Datos recibidos:', { nombre, email, telefono });
    
    if (!nombre) {
      return res.status(400).json({ 
        success: false,
        error: 'El nombre es requerido' 
      });
    }

    // Tu tabla tiene: name, contact_info
    const contactInfo = email || telefono ? 
      `Email: ${email || 'No proporcionado'}, Tel: ${telefono || 'No proporcionado'}` : 
      null;
    
    const userId = 1; // Usuario admin por defecto
    
    const query = `INSERT INTO workers (name, contact_info, created_by_user_id) VALUES (?, ?, ?)`;
    const [result] = await db.execute(query, [nombre, contactInfo, userId]);
    
    console.log('✅ Trabajador creado, ID:', result.insertId);
    
    return res.status(201).json({
      success: true,
      message: 'Trabajador creado exitosamente',
      id: result.insertId,
      worker: { name: nombre, contact_info: contactInfo }
    });
    
  } catch (error) {
    console.error('❌ Error en createWorker:', error.message);
    return res.status(500).json({ 
      success: false,
      error: 'Error al crear trabajador',
      details: error.message
    });
  }
};

// 2. Función para obtener trabajadores
const getWorkers = async (req, res) => {
  try {
    const [workers] = await db.execute('SELECT * FROM workers');
    return res.json({
      success: true,
      count: workers.length,
      data: workers
    });
  } catch (error) {
    console.error('Error obteniendo trabajadores:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error al obtener trabajadores' 
    });
  }
};

// 3. Función para obtener trabajador por ID
const getWorkerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [workers] = await db.execute('SELECT * FROM workers WHERE id = ?', [id]);
    
    if (workers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Trabajador no encontrado'
      });
    }
    
    return res.json({
      success: true,
      data: workers[0]
    });
  } catch (error) {
    console.error('Error obteniendo trabajador:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error al obtener trabajador' 
    });
  }
};

// 4. Función para actualizar trabajador
const updateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ 
        success: false,
        error: 'El nombre es requerido' 
      });
    }

    const contactInfo = email || telefono ? 
      `Email: ${email || 'No proporcionado'}, Tel: ${telefono || 'No proporcionado'}` : 
      null;
    
    const query = `UPDATE workers SET name = ?, contact_info = ? WHERE id = ?`;
    const [result] = await db.execute(query, [nombre, contactInfo, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Trabajador no encontrado'
      });
    }
    
    return res.json({
      success: true,
      message: 'Trabajador actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando trabajador:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error al actualizar trabajador' 
    });
  }
};

// 5. Función para eliminar trabajador (cambiar estado si tuvieras, o eliminar)
const deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `DELETE FROM workers WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Trabajador no encontrado'
      });
    }
    
    return res.json({
      success: true,
      message: 'Trabajador eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando trabajador:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error al eliminar trabajador' 
    });
  }
};

// ✅ EXPORTA TODAS LAS FUNCIONES CORRECTAMENTE
module.exports = {
  createWorker,
  getWorkers,
  getWorkerById,
  updateWorker,
  deleteWorker
};