
import { TaskTemplate, Priority } from '../types';

export const PROCESS_TEMPLATES: TaskTemplate[] = [
  {
    id: 'tmpl_siniestro_auto',
    name: 'Apertura Siniestro Auto',
    taskType: 'Siniestro',
    defaultTitle: 'Siniestro Auto - [Cliente]',
    defaultDescription: 'Gestión de apertura y seguimiento de siniestro de automóvil.',
    defaultTags: [], // Etiquetas eliminadas
    defaultPriority: Priority.HIGH,
    defaultSubtasks: [
      'Contactar con el cliente',
      'Recibir documentación / Fotos',
      'Aperturar siniestro en web compañía',
      'Enviar volante de reparación',
      'Confirmar peritaje',
      'Cierre y encuesta satisfacción'
    ]
  },
  {
    id: 'tmpl_renovacion',
    name: 'Revisión de Cartera (Renovación)',
    taskType: 'Renovación',
    defaultTitle: 'Renovación - [Póliza]',
    defaultDescription: 'Análisis de subida de prima y búsqueda de alternativas.',
    defaultTags: [], // Etiquetas eliminadas
    defaultPriority: Priority.MEDIUM,
    defaultSubtasks: [
      'Descargar recibo nueva anualidad',
      'Comparar prima vs año anterior',
      'Llamar al cliente',
      'Negociar descuento con Cía si procede'
    ]
  },
  {
    id: 'tmpl_alta_salud',
    name: 'Nueva Póliza Salud',
    taskType: 'Alta Póliza',
    defaultTitle: 'Alta Salud - [Cliente]',
    defaultDescription: 'Gestión de nueva contratación ramo salud.',
    defaultTags: [], // Etiquetas eliminadas
    defaultPriority: Priority.MEDIUM,
    defaultSubtasks: [
      'Recopilar datos asegurados y edades',
      'Enviar comparativa (3 opciones)',
      'Resolver dudas carencias/copagos',
      'Firmar solicitud y cuestionario salud',
      'Emitir póliza'
    ]
  },
  {
    id: 'tmpl_impago',
    name: 'Gestión de Recibo Devuelto',
    taskType: 'Cobros',
    defaultTitle: 'Impago - [Póliza]',
    defaultDescription: 'Gestión de cobro de recibo devuelto por el banco.',
    defaultTags: [], // Etiquetas eliminadas
    defaultPriority: Priority.HIGH,
    defaultSubtasks: [
      'Verificar motivo devolución',
      'Contactar cliente (Llamada)',
      'Solicitar nueva cuenta bancaria',
      'Rehabilitar póliza en compañía'
    ]
  }
];
