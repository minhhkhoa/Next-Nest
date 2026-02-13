export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  isOk: boolean;
  isError: boolean;
}

export type CVFormValues = {
  personalInfo: {
    name: string;
    email: string;
    avatar: string;
    phone: string;
    description: string;
    address?: string;
    link?: string;
  };
  professionalSummary: string;
  skills: { value: string }[];
  education: {
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
  }[];
  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    responsibilities: { value: string }[];
  }[];
  projects: {
    name: string;
    description: string;
  }[];
};


