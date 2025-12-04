// controllers/taskController.js - VERSIÓN COMPLETA Y FUNCIONAL
const db = require('../config/db');

// 1. Función para CREAR tarea
exports.createTask = async (req, res) => {
  try {
    console.log('🎯 CREATE TASK - Datos recibidos:', req.body);
    
    const { titulo, descripcion, fecha_limite, trabajador_id } = req.body;
    
    // Validación básica
    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: 'El título es requerido' 
      });
    }

    // Mapear español → inglés (tu BD tiene columnas en inglés)
    const title = titulo;
    const description = descripcion || null;
    const due_date = fecha_limite || null;
    const assigned_to_worker_id = trabajador_id || null;
    const created_by_user_id = 1; // Usuario nelson (id=1)

    console.log('📝 Datos mapeados:', { 
      title, description, due_date, assigned_to_worker_id, created_by_user_id 
    });

    // Query INSERT (columnas en INGLÉS como tu tabla)
    const query = `
      INSERT INTO tasks 
        (title, description, due_date, assigned_to_worker_id, created_by_user_id, status) 
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    
    const [result] = await db.execute(query, [
      title, 
      description, 
      due_date, 
      assigned_to_worker_id, 
      created_by_user_id
    ]);
    
    console.log('✅ Tarea creada. ID:', result.insertId);
    
    return res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      id: result.insertId,
      task: {
        id: result.insertId,
        titulo: title,
        descripcion: description,
        fecha_limite: due_date,
        trabajador_id: assigned_to_worker_id,
        status: 'pending'
      }
    });
    
  } catch (error) {
    console.error('❌ ERROR en createTask:');
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code);
    console.error('   SQL:', error.sql);
    
    // Manejo de errores específicos
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        error: 'El trabajador seleccionado no existe'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Error al crear tarea',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 2. Función para OBTENER tareas
exports.getTasks = async (req, res) => {
  try {
    console.log('🔍 GET TASKS llamado');
    
    // Query con alias español para frontend
    const query = `
      SELECT 
        id,
        title as titulo,
        description as descripcion,
        due_date as fecha_limite,
        status,
        assigned_to_worker_id as trabajador_id,
        created_at,
        updated_at
      FROM tasks 
      ORDER BY created_at DESC
    `;
    
    const [tasks] = await db.execute(query);
    
    console.log(`✅ ${tasks.length} tareas encontradas`);
    
    return res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
    
  } catch (error) {
    console.error('❌ Error en getTasks:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener tareas'
    });
  }
};

// 3. Funciones adicionales (pueden implementarse después)
exports.getTaskById = async (req, res) => {
  res.status(501).json({ success: false, error: 'No implementado aún' });
};

exports.updateTask = async (req, res) => {
  res.status(501).json({ success: false, error: 'No implementado aún' });
};

exports.deleteTask = async (req, res) => {
  res.status(501).json({ success: false, error: 'No implementado aún' });
};