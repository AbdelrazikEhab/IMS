export const QUEUE_NAMES = {
  AUDIT_LOG: 'audit-log',
  EMAIL: 'email',
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
  PUSH: 'push',
  VIDEO_PROCESSING: 'video-processing',
  BOOK_PDF_WATERMARK: 'book-pdf-watermark',
  AI_JOBS: 'ai-jobs',
  COURSE_DUPLICATE: 'course-duplicate',
  AUDIT_EXPORT: 'audit-export',
  PAYMENT: 'payment',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
