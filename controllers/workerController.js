// controllers/workerController.js
const db = require('../config/db');

exports.createWorker = async (req, res) => {
  try {
    console.log('========== CREAR TRABAJADOR ==========');
    console.log('📥 Headers:', req.headers);
    console.log('📥 Body recibido:', req.body);
    console.log('📥 Método:', req.method);
    console.log('📥 URL:', req.originalUrl);
    
    const { name, contact_info } = req.body;
    
    console.log('📥 Datos parseados:', { name, contact_info });
    
    if (!name || name.trim() === '') {
      console.log('❌ Error: Nombre vacío');
      return res.status(400).json({
        success: false,
        message: 'El nombre del trabajador es requerido'
      });
    }
    
    // Usuario por defecto
    const created_by_user_id = 1;
    
    console.log('🔍 Ejecutando query SQL...');
    const [result] = await db.execute(
      'INSERT INTO workers (name, contact_info, created_by_user_id) VALUES (?, ?, ?)',
      [name.trim(), contact_info || null, created_by_user_id]
    );
    
    console.log('✅ Trabajador insertado, ID:', result.insertId);
    console.log('======================================');
    
    return res.status(201).json({
      success: true,
      message: 'Trabajador creado exitosamente',
      workerId: result.insertId
    });
    
  } catch (error) {
    console.error('❌ ERROR EN createWorker:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ MySQL error code:', error.code);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor al crear trabajador',
      error: error.message
    });
  }
};

// ✅ Función para obtener todos los trabajadores
exports.getWorkers = async (req, res) => {
  try {
    const [workers] = await db.execute('SELECT * FROM workers ORDER BY name');
    
    return res.json({
      success: true,
      count: workers.length,
      data: workers
    });
    
  } catch (error) {
    console.error('Error en getWorkers:', error);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener trabajadores',
      error: error.message
    });
  }
};

// ✅ Función para obtener trabajador por ID (OPCIONAL)
exports.getWorkerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [workers] = await db.execute('SELECT * FROM workers WHERE id = ?', [id]);
    
    if (workers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trabajador no encontrado'
      });
    }
    
    return res.json({
      success: true,
      data: workers[0]
    });
    
  } catch (error) {
    console.error('Error en getWorkerById:', error);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener trabajador',
      error: error.message
    });
  }
};

// ✅ Función para eliminar trabajador (OPCIONAL)
exports.deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el trabajador existe
    const [existing] = await db.execute('SELECT * FROM workers WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trabajador no encontrado'
      });
    }
    
    // Eliminar el trabajador
    await db.execute('DELETE FROM workers WHERE id = ?', [id]);
    
    return res.json({
      success: true,
      message: 'Trabajador eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error en deleteWorker:', error);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor al eliminar trabajador',
      error: error.message
    });
  }
};

// ⚠️ NO exportes updateWorker si no lo vas a usar todavía
// exports.updateWorker = async (req, res) => { ... }