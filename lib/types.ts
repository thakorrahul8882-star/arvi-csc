export interface ServiceItem {
  id: string;
  category: string;
  gujaratiName: string;
  englishName: string;
  fee: number;
  processingTime: string;
  requiredDocuments: string[];
  descriptionGu: string;
  descriptionEn: string;
  icon: string;
  active: boolean;
  order: number;
}

export type ApplicationStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'VERIFIED' | 'FAILED';

export interface ApplicationItem {
  applicationId: string;
  customerName: string;
  mobile: string;
  village: string;
  serviceId: string;
  serviceName: string;
  fee: number;
  notes?: string;
  documentName?: string;
  documentData?: string; // base64 preview or full data URI
  documentType?: string; // image/jpeg, application/pdf, etc.
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  paymentUtr?: string;
  adminRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchemeItem {
  id: string;
  type: 'SCHEME' | 'RECRUITMENT' | 'FARMER' | 'EDUCATION' | 'ANNOUNCEMENT';
  titleGu: string;
  titleEn: string;
  department: string;
  deadline: string;
  detailsGu: string;
  detailsEn: string;
  link?: string;
  requiredDocuments?: string[];
  benefits?: string;
  eligibility?: string;
  applicationProcess?: string;
  active: boolean;
  createdAt: string;
}

export interface CenterSettings {
  id: string;
  ownerName: string;
  contactPhone: string;
  whatsappNumber: string;
  upiId: string;
  location: string;
  bannerNoticeGu: string;
  bannerNoticeEn: string;
  visitorCount: number;
}
