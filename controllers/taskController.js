// backend/controllers/taskController.js
const db = require('../config/db');

exports.getAllTasks = async (req, res) => {
  console.log('✅ GET /tasks - Obteniendo todas las tareas');
  
  try {
    // Si tu tabla tiene relación con trabajadores
    const query = `
      SELECT t.*, tr.nombre as trabajador_nombre 
      FROM tareas t 
      LEFT JOIN trabajadores tr ON t.trabajador_id = tr.id 
      ORDER BY t.id DESC
    `;
    
    console.log('🔍 Query:', query);
    
    const [results] = await db.query(query);
    
    console.log(`✅ Encontradas ${results.length} tareas`);
    console.log('📊 Ejemplo:', results[0]);
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo tareas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener tareas',
      details: error.message
    });
  }
};