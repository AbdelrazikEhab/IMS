export declare const QUEUE_NAMES: {
    readonly AUDIT_LOG: "audit-log";
    readonly EMAIL: "email";
    readonly SMS: "sms";
    readonly WHATSAPP: "whatsapp";
    readonly PUSH: "push";
    readonly VIDEO_PROCESSING: "video-processing";
    readonly BOOK_PDF_WATERMARK: "book-pdf-watermark";
    readonly AI_JOBS: "ai-jobs";
    readonly COURSE_DUPLICATE: "course-duplicate";
    readonly AUDIT_EXPORT: "audit-export";
    readonly PAYMENT: "payment";
};
export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
