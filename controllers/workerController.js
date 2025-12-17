// backend/controllers/workerController.js
const db = require('../config/db');

exports.getAllWorkers = async (req, res) => {
  console.log('👷 GET /workers - Obteniendo todos los trabajadores');
  
  try {
    const query = 'SELECT * FROM trabajadores ORDER BY id DESC';
    console.log('🔍 Query:', query);
    
    const [results] = await db.query(query);
    
    console.log(`✅ Encontrados ${results.length} trabajadores`);
    console.log('📊 Ejemplo:', results[0]);
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo trabajadores:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener trabajadores',
      details: error.message
    });
  }
};

exports.createWorker = async (req, res) => {
  console.log('👷 POST /workers - Creando trabajador');
  console.log('📦 Datos recibidos:', req.body);
  
  try {
    const { nombre, cargo, email, telefono } = req.body;
    
    if (!nombre || !cargo) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y cargo son requeridos'
      });
    }
    
    const query = 'INSERT INTO trabajadores (nombre, cargo, email, telefono) VALUES (?, ?, ?, ?)';
    const values = [nombre, cargo, email || null, telefono || null];
    
    console.log('💾 Query:', query);
    console.log('💾 Values:', values);
    
    const [result] = await db.query(query, values);
    
    console.log('✅ Trabajador creado. ID:', result.insertId);
    
    res.status(201).json({
      success: true,
      message: 'Trabajador creado exitosamente',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('❌ Error creando trabajador:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear trabajador',
      details: error.message
    });
  }
};